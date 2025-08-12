/* eslint-disable camelcase */
exports.up = (pgm) => {
  // Tabla para Ciclos Escolares
  pgm.createTable('ciclos_escolares', {
    id: 'id',
    codigo: { type: 'varchar(20)', notNull: true, unique: true }, // ej: 2025-3
    descripcion: { type: 'varchar(255)', notNull: true },
    tipo_periodo: { type: 'varchar(50)' }, // Semestral, Cuatrimestral
    fecha_inicio: { type: 'date', notNull: true },
    fecha_fin: { type: 'date', notNull: true },
  });

  // Tabla para Licenciaturas
  pgm.createTable('licenciaturas', {
    id: 'id',
    nombre: { type: 'varchar(255)', notNull: true, unique: true },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('ciclos_escolares');
  pgm.dropTable('licenciaturas');
};