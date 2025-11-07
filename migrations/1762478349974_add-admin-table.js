/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('administradores', {
    id: 'id',
    username: { type: 'varchar(100)', notNull: true, unique: true },
    password_hash: { type: 'varchar(255)', notNull: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('administradores');
};