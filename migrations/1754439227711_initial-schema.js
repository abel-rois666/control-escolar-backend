// migrations/....-initial-schema.js

/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // --- 1. Tabla de Conceptos ---
  // El catálogo de todo lo que se puede cobrar.
  pgm.createTable('conceptos', {
    id: 'id', // Crea un 'id' numérico que se auto-incrementa
    nombre_concepto: { type: 'varchar(255)', notNull: true },
    aplica_beca: { type: 'boolean', notNull: true, default: false },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.db.func('current_timestamp'),
    },
  });

  // --- 2. Tabla de Listas de Precios ---
  // Los diferentes "contratos" o planes de precios.
  pgm.createTable('listas_de_precios', {
    id: 'id',
    nombre_lista: { type: 'varchar(255)', notNull: true, unique: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.db.func('current_timestamp'),
    },
  });

  // --- 3. Tabla de Items de la Lista ---
  // La tabla que une un Concepto con una ListaDePrecios y le asigna un monto.
  pgm.createTable('items_de_la_lista', {
    id: 'id',
    lista_de_precios_id: {
      type: 'integer',
      notNull: true,
      references: '"listas_de_precios"', // Crea la relación (llave foránea)
      onDelete: 'cascade',
    },
    concepto_id: {
      type: 'integer',
      notNull: true,
      references: '"conceptos"', // Crea la relación (llave foránea)
      onDelete: 'cascade',
    },
    monto: { type: 'decimal(10, 2)', notNull: true }, // Ej: 12345678.90
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.db.func('current_timestamp'),
    },
  });
};

exports.down = (pgm) => {
  // Para deshacer, borramos las tablas en orden inverso a su creación
  pgm.dropTable('items_de_la_lista');
  pgm.dropTable('listas_de_precios');
  pgm.dropTable('conceptos');
};