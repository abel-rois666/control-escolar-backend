/* eslint-disable camelcase */
exports.up = (pgm) => {
  // Añadimos las nuevas columnas para el nombre
  pgm.addColumn('alumnos', {
    nombre: { type: 'varchar(100)' },
    apellido_paterno: { type: 'varchar(100)' },
    apellido_materno: { type: 'varchar(100)' },
  });

  // Eliminamos la columna antigua
  pgm.dropColumn('alumnos', 'nombre_completo');
};

exports.down = (pgm) => {
  // Para revertir, volvemos a añadir la columna antigua
  pgm.addColumn('alumnos', {
    nombre_completo: { type: 'varchar(255)' },
  });

  // Y eliminamos las nuevas
  pgm.dropColumn('alumnos', 'nombre');
  pgm.dropColumn('alumnos', 'apellido_paterno');
  pgm.dropColumn('alumnos', 'apellido_materno');
};