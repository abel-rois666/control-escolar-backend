// migrations/....-add-transactional-tables.js

/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // --- 1. Tabla de Cargos ---
  // Cada deuda individual que un alumno tiene pendiente.
  pgm.createTable('cargos', {
    id: 'id',
    alumno_id: {
      type: 'integer',
      notNull: true,
      references: '"alumnos"',
      onDelete: 'cascade', // Si se borra un alumno, se borran sus cargos.
    },
    concepto_id: {
      type: 'integer',
      notNull: true,
      references: '"conceptos"',
      onDelete: 'restrict', // No se puede borrar un concepto si hay cargos asociados.
    },
    monto_original: { type: 'decimal(10, 2)', notNull: true },
    monto_descuento: { type: 'decimal(10, 2)', notNull: true, default: 0 },
    monto_final: { type: 'decimal(10, 2)', notNull: true },
    saldo_pendiente: { type: 'decimal(10, 2)', notNull: true },
    estatus: { type: 'varchar(50)', notNull: true, default: 'Pendiente' }, // Pendiente, Pagado, Vencido
    fecha_vencimiento: { type: 'date' }, // La fecha límite de pago
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  // --- 2. Tabla de Recibos ---
  // Registra cada transacción de pago que entra.
  pgm.createTable('recibos', {
    id: 'id',
    folio: { type: 'varchar(50)', notNull: true, unique: true },
    alumno_id: {
      type: 'integer',
      notNull: true,
      references: '"alumnos"',
      onDelete: 'cascade',
    },
    monto_total_recibido: { type: 'decimal(10, 2)', notNull: true },
    fecha_pago: { type: 'date', notNull: true },
    forma_pago: { type: 'varchar(50)' }, // Efectivo, Transferencia
    banco: { type: 'varchar(100)' },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  // --- 3. Tabla de Detalles del Pago ---
  // La tabla "mágica" que conecta el dinero de un Recibo con los Cargos que salda.
  pgm.createTable('detalles_del_pago', {
    id: 'id',
    recibo_id: {
      type: 'integer',
      notNull: true,
      references: '"recibos"',
      onDelete: 'cascade', // Si se borra un recibo, se borran sus detalles.
    },
    cargo_id: {
      type: 'integer',
      notNull: true,
      references: '"cargos"',
      onDelete: 'cascade', // Si se borra un cargo, se borra el detalle de pago.
    },
    monto_aplicado: { type: 'decimal(10, 2)', notNull: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = (pgm) => {
  // Borramos en orden inverso para no violar las restricciones de llaves foráneas.
  pgm.dropTable('detalles_del_pago');
  pgm.dropTable('recibos');
  pgm.dropTable('cargos');
};