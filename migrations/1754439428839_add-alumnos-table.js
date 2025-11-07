// migrations/....-add-alumnos-table.js

/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('alumnos', {
    id: 'id',
    matricula: { type: 'varchar(50)', notNull: true, unique: true },
    nombre_completo: { type: 'varchar(255)', notNull: true },
    estatus: { type: 'varchar(50)', notNull: true, default: 'Activo' }, // Ej: Activo, Baja, Egresado
    carrera: { type: 'varchar(255)' },
    grado: { type: 'varchar(50)' },
    grupo: { type: 'varchar(50)' },
    turno: { type: 'varchar(50)' },
    email_contacto: { type: 'varchar(255)' },
    telefono_celular: { type: 'varchar(50)' },
    nombre_tutor: { type: 'varchar(255)' },
    porcentaje_beca: { type: 'decimal(5, 2)', notNull: true, default: 0.0 }, // Ej: 25.50
    
    // --- La conexión clave ---
    lista_de_precios_id: {
      type: 'integer',
      notNull: true,
      references: '"listas_de_precios"', // Conecta con la tabla que ya creamos
      onDelete: 'restrict', // Evita borrar una lista de precios si un alumno la está usando
    },
    
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.db.func('current_timestamp'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('alumnos');
};