// js/metadatosEntidades.js
const METADATOS_ENTIDADES = {
  alumnograduacion: {
    pk: ['alumnograduacion_id'], 
    unique: ['alumnograduacion_login', 'alumnograduacion_dni', 'alumnograduacion_email'],

    // Para el modo estricto (prechecks básicos)
    requeridosAdd: [
      'alumnograduacion_login',
      'alumnograduacion_password',
      'alumnograduacion_nombre',
      'alumnograduacion_apellidos',
      'alumnograduacion_titulacion',
      'alumnograduacion_dni',
      'alumnograduacion_telefono',
      'alumnograduacion_direccion',
      'alumnograduacion_email'
    ],

    ficheroAdd: {
      campo: 'nuevo_alumnograduacion_fotoacto',
      tiposMimePermitidos: ['image/jpeg'],
      maxBytes: 1999999 // < 2.000.000
    }
  },

  articulo: {
    pk: ['CodigoA'],
    unique: ['ISSN'],
    requeridosAdd: ['CodigoA', 'ISSN', 'TituloA'],
    ficheroAdd: null
  },

  ubicacion: {
    pk: ['id_site'],
    unique: [],
    requeridosAdd: ['id_site'],
    ficheroAdd: null
  }
};
