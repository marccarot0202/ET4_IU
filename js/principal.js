// js/principal.js

function obtenerFotoSeleccionada() {
  const input = document.getElementById('nuevo_alumnograduacion_fotoacto');
  if (!input || !input.files || input.files.length === 0) return null;
  return input.files[0];
}

function escribirResultado(obj) {
  const pre = document.getElementById('resultado');
  pre.textContent = JSON.stringify(obj, null, 2);
}

/**
 * Clona el lote (para no mutar el fichero externo) y sustituye '__FOTO__' por el File seleccionado.
 * Si no hay foto, deja el campo como null (y en estricto saldrá FICHERO_FALTANTE).
 */
function prepararLote(loteBase, fotoFile) {
  const lote = JSON.parse(JSON.stringify(loteBase || []));

  for (const peticion of lote) {
    if (!peticion.datos) continue;

    for (const [k, v] of Object.entries(peticion.datos)) {
      if (v === '__FOTO__') {
        peticion.datos[k] = fotoFile || null;
      }
    }
  }

  return lote;
}

// MODO ESTÁNDAR: ejecuta de verdad contra el back
async function ejecutarEstandar() {
  try {
    const foto = obtenerFotoSeleccionada();
    if (!foto) {
      escribirResultado({ ok: false, error: 'Selecciona un JPG antes de ejecutar el modo estándar.' });
      return;
    }

    const lote = prepararLote(LOTE_PETICIONES_ESTANDAR, foto);

    const executor = new EjecutorLoteBack(lote, 'estandar');
    const resultado = await executor.ejecutar();

    const okGlobal = Array.isArray(resultado) ? resultado.every(r => r.ok === true) : false;
    escribirResultado({ ok: okGlobal, modo: 'estandar', resultado });
  } catch (e) {
    escribirResultado({ ok: false, error: e.message || String(e) });
  }
}

// MODO ESTRICTO: NO toca BD; solo prechecks (SEARCH)
async function ejecutarEstricto() {
  try {
    // En estricto NO obligo a seleccionar foto:
    // - si no se selecciona, saldrá el conflicto FICHERO_FALTANTE (para demostrar el precheck)
    const foto = obtenerFotoSeleccionada();

    const lote = prepararLote(LOTE_PETICIONES_ESTRICTO, foto);

    const executor = new EjecutorLoteBack(lote, 'estricto');
    const resultado = await executor.ejecutar();

    // Aquí el ok global no significa “se ejecutó”, sino “se pudo predecir”.
    escribirResultado({ ok: true, modo: 'estricto', resultado });
  } catch (e) {
    escribirResultado({ ok: false, error: e.message || String(e) });
  }
}
