/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = (pgm) => {
  // 1. Renombrar la tabla
  pgm.renameTable('administradores', 'usuarios');

  // 2. Añadir nuevas columnas
  pgm.addColumns('usuarios', {
    nombre_completo: { type: 'varchar(255)', notNull: true, default: 'Admin' },
    // JSONB es más eficiente para guardar y consultar permisos
    permissions: { type: 'jsonb', notNull: true, default: '{}' }
  });

  // 3. Definir todos los permisos de la aplicación
  const allPermissions = JSON.stringify({
    // Alumnos
    "alumnos_ver": true,
    "alumnos_crear": true,
    "alumnos_editar": true,
    "alumnos_eliminar": true,
    "alumnos_importar": true,
    
    // Pagos
    "pagos_recibir": true,
    "pagos_ver_recibos": true,
    "pagos_ver_historial": true,
    "pagos_ver_estado_cuenta": true,

    // Reportes
    "reportes_ver_adeudos": true,
    "reportes_ver_ingresos": true,
    "reportes_generar_certificados": true,

    // Herramientas
    "herramientas_generar_xml": true,

    // Configuración
    "config_ver_ciclos": true,
    "config_ver_licenciaturas": true,
    "config_ver_conceptos": true,
    "config_ver_planes": true,
    "config_ver_usuarios": true // Permiso para ver esta nueva sección
  });

  // 4. Darle al primer admin (ID 1) todos los permisos
  pgm.sql(`
    UPDATE usuarios 
    SET 
      permissions = '${allPermissions}',
      nombre_completo = 'Administrador Principal'
    WHERE id = 1
  `);
};

exports.down = (pgm) => {
  // Revierte los cambios en orden inverso
  pgm.dropColumns('usuarios', ['nombre_completo', 'permissions']);
  pgm.renameTable('usuarios', 'administradores');
};