// js/ejecutorLoteBack.js
class EjecutorLoteBack {
  /**
   * @param {Array} peticiones Array de { entidad, accion, datos, paginacion? }
   * @param {'estandar'|'estricto'} modo
   */
  constructor(peticiones, modo = 'estandar') {
    this.peticiones = Array.isArray(peticiones) ? peticiones : [];
    this.modo = modo;

    // Para estricto: detectar conflictos dentro del propio lote
    this._reservasUnique = {}; // { entidad: { campo: Set(valores) } }
  }

  async ejecutar() {
    return this.modo === 'estricto'
      ? await this._ejecutarEstricto()
      : await this._ejecutarEstandar();
  }

  // -------------------------
  // MODO ESTÁNDAR: ejecuta contra el back, en orden secuencial
  // -------------------------
  async _ejecutarEstandar() {
    const resultados = [];

    for (let i = 0; i < this.peticiones.length; i++) {
      const p = this.peticiones[i];

      try {
        const resp = await llamarBack(p.entidad, p.accion, p.datos, p.paginacion);

        resultados.push({
          indice: i,
          entidad: p.entidad,
          accion: p.accion,
          datosEnviados: this._resumenDatos(p.datos),
          ok: resp.ok === true,
          code: resp.code ?? null,
          respuesta: resp
        });
      } catch (e) {
        resultados.push({
          indice: i,
          entidad: p.entidad,
          accion: p.accion,
          datosEnviados: this._resumenDatos(p.datos),
          ok: false,
          code: 'EXCEPTION',
          error: e.message || String(e)
        });
      }
    }

    return resultados;
  }

  // -------------------------
  // MODO ESTRICTO: solo prechecks (SEARCH), NO modifica BD
  // -------------------------
  async _ejecutarEstricto() {
    const resultados = [];

    for (let i = 0; i < this.peticiones.length; i++) {
      const p = this.peticiones[i];
      const meta = METADATOS_ENTIDADES[p.entidad] || { pk: [], unique: [], requeridosAdd: [], ficheroAdd: null };

      let res;
      switch (p.accion) {
        case 'ADD':
          res = await this._precheckAdd(p, meta);
          break;
        case 'EDIT':
          res = await this._precheckEdit(p, meta);
          break;
        case 'DELETE':
          res = await this._precheckDelete(p, meta);
          break;
        default:
          res = {
            entidad: p.entidad,
            accion: p.accion,
            datosEnviados: this._resumenDatos(p.datos),
            ejecutable: true,
            conflictos: [],
            nota: 'Acción sin precheck específico (se asume ejecutable).'
          };
      }

      resultados.push({ indice: i, ...res });
    }

    return resultados;
  }

  // --------- PRECHECKS ---------

  async _precheckAdd(p, meta) {
    const conflictos = [];

    // 1) Requeridos
    for (const campo of (meta.requeridosAdd || [])) {
      if (!p.datos || p.datos[campo] === undefined || p.datos[campo] === null || String(p.datos[campo]).trim() === '') {
        conflictos.push({ tipo: 'FALTA_REQUERIDO', campo, mensaje: `Falta el campo requerido: ${campo}` });
      }
    }

    // 2) Fichero requerido (si aplica)
    if (meta.ficheroAdd) {
      const { campo, tiposMimePermitidos, maxBytes } = meta.ficheroAdd;
      const f = p.datos ? p.datos[campo] : null;

      if (!(f instanceof File)) {
        conflictos.push({ tipo: 'FICHERO_FALTANTE', campo, mensaje: `Falta el fichero requerido: ${campo}` });
      } else {
        if (tiposMimePermitidos && !tiposMimePermitidos.includes(f.type)) {
          conflictos.push({ tipo: 'FICHERO_TIPO', campo, mensaje: `Tipo no permitido: ${f.type}` });
        }
        if (typeof maxBytes === 'number' && f.size >= maxBytes + 1) {
          conflictos.push({ tipo: 'FICHERO_TAMANIO', campo, mensaje: `Tamaño excedido: ${f.size} bytes` });
        }
      }
    }

    // 3) UNIQUE: conflicto dentro del lote (simulación)
    for (const campo of (meta.unique || [])) {
      const valor = p.datos ? p.datos[campo] : undefined;
      if (!valor) continue;

      if (this._uniqueYaReservado(p.entidad, campo, String(valor))) {
        conflictos.push({
          tipo: 'UNIQUE_EN_LOTE',
          campo,
          valor,
          mensaje: `En el lote ya hay otra petición que usa ${campo}=${valor}`
        });
      }
    }

    // 4) UNIQUE: conflicto contra BD (SEARCH)
    for (const campo of (meta.unique || [])) {
      const valor = p.datos ? p.datos[campo] : undefined;
      if (!valor) continue;

      try {
        const resp = await llamarBack(p.entidad, 'SEARCH', { [campo]: valor });
        const hay = Array.isArray(resp.resource) && resp.resource.length > 0;

        if (hay) {
          conflictos.push({
            tipo: 'UNIQUE_DUPLICADO_BD',
            campo,
            valor,
            mensaje: `En BD ya existe un registro con ${campo}=${valor}`
          });
        }
      } catch (e) {
        conflictos.push({
          tipo: 'ERROR_CONSULTA',
          campo,
          valor,
          mensaje: `Error al comprobar en BD ${campo}: ${e.message || String(e)}`
        });
      }
    }

    const ejecutable = conflictos.length === 0;

    // Si es ejecutable, “reservamos” los unique para detectar duplicados en peticiones siguientes del lote
    if (ejecutable) {
      for (const campo of (meta.unique || [])) {
        const valor = p.datos ? p.datos[campo] : undefined;
        if (!valor) continue;
        this._reservarUnique(p.entidad, campo, String(valor));
      }
    }

    return {
      entidad: p.entidad,
      accion: p.accion,
      datosEnviados: this._resumenDatos(p.datos),
      ejecutable,
      conflictos
    };
  }

  async _precheckDelete(p, meta) {
    const conflictos = [];

    // Requiere PK para poder verificar existencia
    const filtro = {};
    for (const pk of (meta.pk || [])) {
      const v = p.datos ? p.datos[pk] : undefined;
      if (!v) conflictos.push({ tipo: 'FALTA_PK', campo: pk, mensaje: `Falta PK para DELETE: ${pk}` });
      else filtro[pk] = v;
    }

    if (conflictos.length === 0 && Object.keys(filtro).length > 0) {
      try {
        const resp = await llamarBack(p.entidad, 'SEARCH', filtro);
        const hay = Array.isArray(resp.resource) && resp.resource.length > 0;
        if (!hay) conflictos.push({ tipo: 'NO_EXISTE', mensaje: `No existe el registro a borrar (según PK).` });
      } catch (e) {
        conflictos.push({ tipo: 'ERROR_CONSULTA', mensaje: `Error al verificar existencia: ${e.message || String(e)}` });
      }
    }

    return {
      entidad: p.entidad,
      accion: p.accion,
      datosEnviados: this._resumenDatos(p.datos),
      ejecutable: conflictos.length === 0,
      conflictos
    };
  }

  async _precheckEdit(p, meta) {
    const conflictos = [];

    // 1) Debe existir por PK (si se proporcionas)
    const filtroPK = {};
    for (const pk of (meta.pk || [])) {
      const v = p.datos ? p.datos[pk] : undefined;
      if (v) filtroPK[pk] = v;
    }

    if ((meta.pk || []).length > 0 && Object.keys(filtroPK).length === 0) {
      // Si no tienes PK real, no puedes verificar bien
      conflictos.push({ tipo: 'FALTA_PK', mensaje: 'No se puede verificar EDIT sin PK en datos.' });
    } else if (Object.keys(filtroPK).length > 0) {
      try {
        const resp = await llamarBack(p.entidad, 'SEARCH', filtroPK);
        const hay = Array.isArray(resp.resource) && resp.resource.length > 0;
        if (!hay) conflictos.push({ tipo: 'NO_EXISTE', mensaje: 'No existe el registro a editar (según PK).' });
      } catch (e) {
        conflictos.push({ tipo: 'ERROR_CONSULTA', mensaje: `Error al verificar existencia: ${e.message || String(e)}` });
      }
    }

    // 2) UNIQUE básico: si intentas poner un unique que ya existe en otro registro
    for (const campo of (meta.unique || [])) {
      const valor = p.datos ? p.datos[campo] : undefined;
      if (!valor) continue;

      try {
        const resp = await llamarBack(p.entidad, 'SEARCH', { [campo]: valor });
        const hay = Array.isArray(resp.resource) && resp.resource.length > 0;

        if (hay) {
          // Si podemos comparar PK para descartar "yo mismo"
          const yoMismo =
            Object.keys(filtroPK).length > 0 &&
            resp.resource.some(r => Object.keys(filtroPK).every(pk => String(r[pk]) === String(filtroPK[pk])));

          if (!yoMismo) {
            conflictos.push({ tipo: 'UNIQUE_DUPLICADO_BD', campo, valor, mensaje: `El valor ${campo}=${valor} ya está en uso.` });
          }
        }
      } catch (e) {
        conflictos.push({ tipo: 'ERROR_CONSULTA', campo, valor, mensaje: `Error al comprobar unique en EDIT: ${e.message || String(e)}` });
      }
    }

    return {
      entidad: p.entidad,
      accion: p.accion,
      datosEnviados: this._resumenDatos(p.datos),
      ejecutable: conflictos.length === 0,
      conflictos
    };
  }

  // --------- utilidades ---------

  _resumenDatos(datos) {
    if (!datos) return {};
    const out = {};
    for (const k of Object.keys(datos)) {
      const v = datos[k];
      out[k] = v instanceof File ? `[File: ${v.name}, ${v.type}, ${v.size} bytes]` : v;
    }
    return out;
  }

  _uniqueYaReservado(entidad, campo, valor) {
    return !!(this._reservasUnique[entidad]?.[campo]?.has(valor));
  }

  _reservarUnique(entidad, campo, valor) {
    if (!this._reservasUnique[entidad]) this._reservasUnique[entidad] = {};
    if (!this._reservasUnique[entidad][campo]) this._reservasUnique[entidad][campo] = new Set();
    this._reservasUnique[entidad][campo].add(valor);
  }
}

