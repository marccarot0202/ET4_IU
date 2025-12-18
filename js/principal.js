function obtenerFotoSeleccionada() {
  const input = document.getElementById('nuevo_alumnograduacion_fotoacto');
  if (!input || !input.files || input.files.length === 0) return null;
  return input.files[0];
}

function escribirResultado(obj) {
  const pre = document.getElementById('resultado');
  pre.textContent = JSON.stringify(obj, null, 2);
}

function generarLoginValidoUnico() {
  // 4–15 chars, SOLO letras
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const pref = 'Marc'; // 4
  const sufLen = 6;    // total 10 (seguro <= 15)

  let suf = '';
  for (let i = 0; i < sufLen; i++) {
    suf += letras[Math.floor(Math.random() * letras.length)];
  }
  return pref + suf;
}

function generarDNIValido() {
  const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const num = Math.floor(Math.random() * 100000000);
  const numStr = String(num).padStart(8, '0');
  return numStr + letras[num % 23];
}


/**
 * Genera un DNI válido (8 dígitos + letra de control).
 * Útil para que el back no falle por letra incorrecta.
 */
function generarDNIValido() {
  const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const num = Math.floor(Math.random() * 100000000); // 0..99.999.999
  const numStr = String(num).padStart(8, '0');
  return numStr + letras[num % 23];
}

/**
 * Crea una petición ADD de alumnograduacion con datos "únicos" (evita SQL_KO por UNIQUE).
 * @param {File|null} fotoFile
 */
function crearPeticionAlumnoConDatosUnicos(fotoFile) {
  const login = generarLoginValidoUnico();

  const datos = {
    //cumplir formato y longitud
    alumnograduacion_login: login,

    // valores “seguros” (ASCII)
    alumnograduacion_password: 'MiclaveSegura',  // >=8, solo letras
    alumnograduacion_nombre: 'Alvaro',
    alumnograduacion_apellidos: 'Garcia Lopez',
    alumnograduacion_titulacion: 'GREI',
    alumnograduacion_dni: generarDNIValido(),
    alumnograduacion_telefono: '612345678',
    alumnograduacion_direccion: 'Rua do Sol 15',

    // email único sin alargar demasiado
    alumnograduacion_email: login.toLowerCase() + '@example.com'
  };

  if (fotoFile) {
    datos.nuevo_alumnograduacion_fotoacto = fotoFile; // clave EXACTA
  }

  return { entidad: 'alumnograduacion', accion: 'ADD', datos };
}


// EJECUCIÓN “ESTÁNDAR”: ejecuta de verdad en el back
async function ejecutarEstandar() {
  try {
    const foto = obtenerFotoSeleccionada();
    if (!foto) {
      escribirResultado({ ok: false, error: 'Selecciona un JPG en el input antes de ejecutar.' });
      return;
    }

    // 1) Petición con datos únicos (evita conflictos UNIQUE)
    const lote = [crearPeticionAlumnoConDatosUnicos(foto)];

    const executor = new EjecutorLoteBack(lote, 'estandar');
    const resultado = await executor.ejecutar();

    // ok global honesto
    const okGlobal = Array.isArray(resultado) ? resultado.every(r => r.ok === true) : false;

    escribirResultado({ ok: okGlobal, modo: 'estandar', resultado });
  } catch (e) {
    escribirResultado({ ok: false, error: e.message || String(e) });
  }
}

// EJECUCIÓN “ESTRICTO”: NO toca BD; hace pre-check
async function ejecutarEstricto() {
  try {
    const foto = obtenerFotoSeleccionada();
    if (!foto) {
      escribirResultado({ ok: false, error: 'Selecciona un JPG también para el modo estricto (solo se valida, no se sube).' });
      return;
    }

    const peticionDuplicada = {
      entidad: 'alumnograduacion',
      accion: 'ADD',
      datos: {
        alumnograduacion_login: 'Marc',
        alumnograduacion_dni: '12345678Z',
        alumnograduacion_email: 'marc@example.com'
        // a propósito incompleta: para ver conflictos
      }
    };

    // Petición “correcta” y completa con datos únicos
    const peticionValida = crearPeticionAlumnoConDatosUnicos(foto);

    const lote = [peticionDuplicada, peticionValida];

    const executor = new EjecutorLoteBack(lote, 'estricto');
    const resultado = await executor.ejecutar();
    escribirResultado({ ok: true, modo: 'estricto', resultado });

  } catch (e) {
    escribirResultado({ ok: false, error: e.message || String(e) });
  }
}

