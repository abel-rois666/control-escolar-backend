/* eslint-disable camelcase */

exports.shorthills = undefined;

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  // 1. Renombrar la columna existente si aún no lo has hecho
  // Si ya ejecutaste la migración anterior para renombrar, puedes comentar o eliminar esta línea.
  pgm.renameColumn('alumnos', 'nombre_completo', 'nombre_completo_old', { ifExists: true });

  // 2. Añadir todas las columnas nuevas del CSV
  pgm.addColumns('alumnos', {
    nombre: { type: 'varchar(100)' },
    apellido_paterno: { type: 'varchar(100)' },
    apellido_materno: { type: 'varchar(100)' },
    sexo: { type: 'varchar(20)' },
    matricula_adicional: { type: 'varchar(50)', unique: true }, // Asumiendo que esta también debe ser única
    curp: { type: 'varchar(18)', unique: true },
    estado_civil: { type: 'varchar(50)' },
    fecha_nacimiento: { type: 'date' },
    edad: { type: 'integer' },
    calle_y_numero: { type: 'text' },
    cp: { type: 'varchar(10)' },
    municipio: { type: 'varchar(100)' },
    estado: { type: 'varchar(100)' }, // Estado de residencia
    telefono_fijo: { type: 'varchar(20)' },
    celular: { type: 'varchar(20)' }, // Ya existía pero lo añadimos para asegurar
    observaciones: { type: 'text' },
    email_personal: { type: 'varchar(255)' },
    email_institucional: { type: 'varchar(255)', unique: true },
    fecha_baja: { type: 'date' },
    motivo_baja: { type: 'text' },
    lugar_nacimiento: { type: 'varchar(100)' },
    estado_nacimiento: { type: 'varchar(100)' },
    nacionalidad: { type: 'varchar(100)' },
    escuela_procedencia: { type: 'varchar(255)' },
    escolaridad_procedencia: { type: 'varchar(100)' },
    estado_escolaridad: { type: 'varchar(100)' },
    fecha_egreso: { type: 'date' },
    fecha_ingreso: { type: 'date' },
    usuario_sistema_creacion: { type: 'varchar(100)' },
    usuario_sistema_actualizacion: { type: 'varchar(100)' },
    promedio_esc_anterior: { type: 'decimal(5, 2)' },
    como_conocio_escuela: { type: 'varchar(255)' },
    enlace_expediente_digital: { type: 'text' }
  });

  // 3. Manejar la columna 'nombre_completo'
  // Si ya no la necesitas, puedes eliminarla.
  // pgm.dropColumn('alumnos', 'nombre_completo_old');
  // Si quieres mantenerla por ahora, déjala.
};

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  // 1. Renombrar 'email_personal' de nuevo a 'email_contacto'
  pgm.renameColumn('alumnos', 'email_personal', 'email_contacto');

  // 2. Eliminar todas las columnas nuevas
  pgm.dropColumns('alumnos', [
    'nombre',
    'apellido_paterno',
    'apellido_materno',
    'sexo',
    'matricula_adicional',
    'curp',
    'estado_civil',
    'fecha_nacimiento',
    'edad',
    'calle_y_numero',
    'cp',
    'municipio',
    'estado',
    'telefono_fijo',
    'celular',
    'observaciones',
    'email_institucional',
    'fecha_baja',
    'motivo_baja',
    'lugar_nacimiento',
    'estado_nacimiento',
    'nacionalidad',
    'escuela_procedencia',
    'escolaridad_procedencia',
    'estado_escolaridad',
    'fecha_egreso',
    'fecha_ingreso',
    'usuario_sistema_creacion',
    'usuario_sistema_actualizacion',
    'promedio_esc_anterior',
    'como_conocio_escuela',
    'enlace_expediente_digital',
  ]);

  // 3. Restaurar la columna 'nombre_completo'
  pgm.renameColumn('alumnos', 'nombre_completo_old', 'nombre_completo');
};