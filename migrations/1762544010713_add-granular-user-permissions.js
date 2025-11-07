/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = (pgm) => {
  // 1. Define los nuevos permisos que vamos a añadir
  const newPermissions = JSON.stringify({
    "usuarios_crear": true,
    "usuarios_editar": true,
    "usuarios_eliminar": true
  });

  // 2. Usamos el operador '||' de JSONB para fusionar los permisos existentes
  //    con los nuevos, solo para los usuarios que ya son administradores.
  pgm.sql(`
    UPDATE usuarios 
    SET permissions = permissions || '${newPermissions}'
    WHERE permissions ? 'config_ver_usuarios'
  `);
};

exports.down = (pgm) => {
  // Opcional: cómo revertirlo (elimina las claves)
  pgm.sql(`
    UPDATE usuarios
    SET permissions = permissions - 'usuarios_crear' - 'usuarios_editar' - 'usuarios_eliminar'
  `);
};