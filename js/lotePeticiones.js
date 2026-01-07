// js/lotePeticiones.js
// ===================
// AQUÍ viven los arrays de peticiones.


// NOTA IMPORTANTE:
// - Si se repite el modo estándar varias veces, los ADD pueden empezar a fallar por
//   PK/UNIQUE duplicados.

// ---------------------------
// LOTE PARA MODO ESTÁNDAR
// (ejecuta de verdad contra el back)
// ---------------------------
const LOTE_PETICIONES_ESTANDAR = [
  // 0) SEARCH vacío 
  {
    entidad: 'alumnograduacion',
    accion: 'SEARCH',
    datos: { }
  },

  // 1) SEARCH por titulación
  {
    entidad: 'alumnograduacion',
    accion: 'SEARCH',
    datos: { alumnograduacion_titulacion: 'GREI' }
  },

  // 2) ADD (debería ser OK la primera vez, luego falla si se repite exactamente igual)
  {
    entidad: 'alumnograduacion',
    accion: 'ADD',
    datos: {
      alumnograduacion_login: 'LoteStd_A1',
      alumnograduacion_password: 'MiclaveSegura',
      alumnograduacion_nombre: 'Alvaro',
      alumnograduacion_apellidos: 'Garcia Lopez',
      alumnograduacion_titulacion: 'GREI',
      alumnograduacion_dni: '90012345M',
      alumnograduacion_telefono: '612345678',
      alumnograduacion_direccion: 'Rua do Sol 15',
      alumnograduacion_email: 'lotestd_a1@example.com',
      nuevo_alumnograduacion_fotoacto: '__FOTO__'
    }
  },

  // 3) SEARCH del registro por login (para ver el efecto del ADD)
  {
    entidad: 'alumnograduacion',
    accion: 'SEARCH',
    datos: { alumnograduacion_login: 'LoteStd_A1' }
  },

  // 4) Otro ADD distinto
  {
    entidad: 'alumnograduacion',
    accion: 'ADD',
    datos: {
      alumnograduacion_login: 'LoteStd_A2',
      alumnograduacion_password: 'MiclaveSegura',
      alumnograduacion_nombre: 'Alvaro',
      alumnograduacion_apellidos: 'Garcia Lopez',
      alumnograduacion_titulacion: 'GREI',
      alumnograduacion_dni: '72938456M',
      alumnograduacion_telefono: '612345678',
      alumnograduacion_direccion: 'Rua do Sol 15',
      alumnograduacion_email: 'lotestd_a2@example.com',
      nuevo_alumnograduacion_fotoacto: '__FOTO__'
    }
  },

  // 5) ADD “mal” a propósito: DUPLICA login/email con A2 para forzar fallo por UNIQUE
  {
    entidad: 'alumnograduacion',
    accion: 'ADD',
    datos: {
      alumnograduacion_login: 'LoteStd_A2',               // DUPLICADO
      alumnograduacion_password: 'MiclaveSegura',
      alumnograduacion_nombre: 'Alvaro',
      alumnograduacion_apellidos: 'Garcia Lopez',
      alumnograduacion_titulacion: 'GREI',
      alumnograduacion_dni: '83492715R',                 // distinto, pero login dup
      alumnograduacion_telefono: '612345678',
      alumnograduacion_direccion: 'Rua do Sol 15',
      alumnograduacion_email: 'lotestd_a2@example.com',  // DUPLICADO
      nuevo_alumnograduacion_fotoacto: '__FOTO__'
    }
  },

  // 6) SEARCH por DNI (otra forma de filtrar)
  {
    entidad: 'alumnograduacion',
    accion: 'SEARCH',
    datos: { alumnograduacion_dni: '72938456M' }
  },

  // 7) SEARCH sobre otras entidades (para demostrar “lote mixto”)
  {
    entidad: 'articulo',
    accion: 'SEARCH',
    datos: { }
  },
  {
    entidad: 'ubicacion',
    accion: 'SEARCH',
    datos: { }
  },
    // Secuencia ADD → EDIT → SEARCH → DELETE → SEARCH (para LOTE_PETICIONES_ESTANDAR)

    {
    entidad: 'alumnograduacion',
    accion: 'ADD',
    datos: {
        alumnograduacion_login: 'LoteStd_X1',
        alumnograduacion_password: 'MiclaveSegura',
        alumnograduacion_nombre: 'Alvaro',
        alumnograduacion_apellidos: 'Garcia Lopez',
        alumnograduacion_titulacion: 'GREI',
        alumnograduacion_dni: '90123456M',
        alumnograduacion_telefono: '612345678',
        alumnograduacion_direccion: 'Rua do Sol 15',
        alumnograduacion_email: 'lotestd_x1@example.com',
        // principal.js lo sustituye por el File seleccionado
        nuevo_alumnograduacion_fotoacto: '__FOTO__'
    }
    },
    {
    entidad: 'alumnograduacion',
    accion: 'EDIT',
    datos: {
        // normalmente el back identifica el registro por login
        alumnograduacion_login: 'LoteStd_X1',

        // cambio visible para comprobar el EDIT
        alumnograduacion_password: 'MiclaveSegura',
        alumnograduacion_nombre: 'Alvaro EDITADO',
        alumnograduacion_apellidos: 'Garcia Lopez',
        alumnograduacion_titulacion: 'GREI',
        alumnograduacion_dni: '90123456M',
        alumnograduacion_telefono: '612345678',
        alumnograduacion_direccion: 'Rua do Sol 15',
        alumnograduacion_email: 'lotestd_x1@example.com',
        nuevo_alumnograduacion_fotoacto: '__FOTO__'
    }
    },
    {
    entidad: 'alumnograduacion',
    accion: 'SEARCH',
    datos: {
        alumnograduacion_login: 'LoteStd_X1'
    }
    },
        {
    entidad: 'alumnograduacion',
    accion: 'DELETE',
    datos: {
        alumnograduacion_dni: '90123456M'
    }
    },
    {
    entidad: 'alumnograduacion',
    accion: 'SEARCH',
    datos: {
        alumnograduacion_dni: '90123456M'
    }
    }
];


// ---------------------------
// LOTE PARA MODO ESTRICTO
// (NO toca BD: prechecks)
// ---------------------------
const LOTE_PETICIONES_ESTRICTO = [
  // 0) Caso “mal” típico: faltan requeridos + puede chocar con UNIQUE en BD
  {
    entidad: 'alumnograduacion',
    accion: 'ADD',
    datos: {
      alumnograduacion_login: 'Marc',
      alumnograduacion_dni: '12345678Z',
      alumnograduacion_email: 'marc@example.com'
    }
  },

  // 1) Caso “bien” (si no existe en BD). Lleva TODO, incluido fichero (placeholder)
  {
    entidad: 'alumnograduacion',
    accion: 'ADD',
    datos: {
      alumnograduacion_login: 'LoteStr_B1',
      alumnograduacion_password: 'MiclaveSegura',
      alumnograduacion_nombre: 'Alvaro',
      alumnograduacion_apellidos: 'Garcia Lopez',
      alumnograduacion_titulacion: 'GREI',
      alumnograduacion_dni: '90012345M',
      alumnograduacion_telefono: '612345678',
      alumnograduacion_direccion: 'Rua do Sol 15',
      alumnograduacion_email: 'lotestr_b1@example.com',
      nuevo_alumnograduacion_fotoacto: '__FOTO__'
    }
  },

  // 2) DUPLICA el DNI dentro del lote (debería saltar conflicto por UNIQUE, al menos a nivel lote)
  {
    entidad: 'alumnograduacion',
    accion: 'ADD',
    datos: {
      alumnograduacion_login: 'LoteStr_B2',
      alumnograduacion_password: 'MiclaveSegura',
      alumnograduacion_nombre: 'Alvaro',
      alumnograduacion_apellidos: 'Garcia Lopez',
      alumnograduacion_titulacion: 'GREI',
      alumnograduacion_dni: '90012345M', // DUPLICADO respecto a la anterior
      alumnograduacion_telefono: '612345678',
      alumnograduacion_direccion: 'Rua do Sol 15',
      alumnograduacion_email: 'lotestr_b2@example.com',
      nuevo_alumnograduacion_fotoacto: '__FOTO__'
    }
  },

  // 3) Caso “mal” solo por fichero faltante (para ver ese conflicto claro)
  {
    entidad: 'alumnograduacion',
    accion: 'ADD',
    datos: {
      alumnograduacion_login: 'LoteStr_SinFoto',
      alumnograduacion_password: 'MiclaveSegura',
      alumnograduacion_nombre: 'Alvaro',
      alumnograduacion_apellidos: 'Garcia Lopez',
      alumnograduacion_titulacion: 'GREI',
      alumnograduacion_dni: '72938456M',
      alumnograduacion_telefono: '612345678',
      alumnograduacion_direccion: 'Rua do Sol 15',
      alumnograduacion_email: 'lotestr_sinfoto@example.com'
      // nuevo_alumnograduacion_fotoacto -> NO, a propósito
    }
  },
    // 4) EDIT mal: falta PK (dni) -> debería marcar FALTA_PK
    {
    entidad: 'alumnograduacion',
    accion: 'EDIT',
    datos: {
        alumnograduacion_login: 'alumno',
        alumnograduacion_email: 'alumno@alumno.com',
        alumnograduacion_nombre: 'Cambio sin dni'
    }
    },

    // 5) EDIT mal: PK (dni) no existe en BD -> NO_EXISTE
    {
    entidad: 'alumnograduacion',
    accion: 'EDIT',
    datos: {
        alumnograduacion_dni: '99999999Z',
        alumnograduacion_login: 'NoExiste',
        alumnograduacion_email: 'noexiste@example.com',
        alumnograduacion_nombre: 'No debería poder'
    }
    },

    // 6) EDIT mal: intenta poner un UNIQUE que ya pertenece a otro (email duplicado) -> UNIQUE_DUPLICADO_BD
    // (Uso un email que ya vi en el SEARCH, por ejemplo el de LoteStd_A2)
    {
    entidad: 'alumnograduacion',
    accion: 'EDIT',
    datos: {
        alumnograduacion_dni: '11111111H',              // existe (login "alumno" en resultados)
        alumnograduacion_login: 'alumno',
        alumnograduacion_email: 'lotestd_a2@example.com', // ya existe en otro registro
        alumnograduacion_nombre: 'Forzar conflicto UNIQUE'
    }
    },

    // 7) EDIT bien: modifica un campo NO-UNIQUE manteniendo login/email del propio registro -> ejecutable: true
    {
    entidad: 'alumnograduacion',
    accion: 'EDIT',
    datos: {
        alumnograduacion_dni: '11111111H',
        alumnograduacion_login: 'alumno',
        alumnograduacion_email: 'alumno@alumno.com',
        alumnograduacion_nombre: 'alumno (editado en estricto)'
    }
    },

    // 8) DELETE mal: falta PK (dni) -> FALTA_PK
    {
    entidad: 'alumnograduacion',
    accion: 'DELETE',
    datos: {
        alumnograduacion_login: 'alumno'
    }
    },

    // 9) DELETE mal: PK no existe -> NO_EXISTE
    {
    entidad: 'alumnograduacion',
    accion: 'DELETE',
    datos: {
        alumnograduacion_dni: '99999999Z'
    }
    },

    // 10) DELETE bien: PK existe -> ejecutable: true ( en estricto NO borra, solo lo “predice”)
    {
    entidad: 'alumnograduacion',
    accion: 'DELETE',
    datos: {
        alumnograduacion_dni: '11111111H'
    }
    },

    // 11) ARTICULO: ADD mal por requeridos -> FALTA_REQUERIDO (ISSN y/o TituloA)
    {
    entidad: 'articulo',
    accion: 'ADD',
    datos: {
        CodigoA: '999'
        // Falta ISSN y TituloA a propósito
    }
    },

    // 12) ARTICULO: ADD mal por UNIQUE duplicado (ISSN ya existente en el SEARCH: 6754-1925) -> UNIQUE_DUPLICADO_BD
    {
    entidad: 'articulo',
    accion: 'ADD',
    datos: {
        CodigoA: '1000',
        ISSN: '6754-1925',
        TituloA: 'Probando ISSN duplicado'
    }
    },

    // 13) UBICACION: DELETE mal por falta PK -> FALTA_PK
    {
    entidad: 'ubicacion',
    accion: 'DELETE',
    datos: { }
    },

    // 14) UBICACION: DELETE bien con PK existente 
    {
    entidad: 'ubicacion',
    accion: 'DELETE',
    datos: {
        id_site: '463'
    }
    }

];
