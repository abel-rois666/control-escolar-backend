/* eslint-disable camelcase */
// migrations/YYYYMMDDHHMMSS_add_fields_to_alumnos.js

exports.shorthands = undefined;

exports.up = (pgm) => {
  // 1. Renombrar la columna existente
  pgm.renameColumn('alumnos', 'email_contacto', 'email_personal');

  // 2. Añadir las nuevas columnas
  pgm.addColumns('alumnos', {
    // Columnas de nombre (reemplazando nombre_completo)
    nombre: { type: 'varchar(100)' },
    apellido_paterno: { type: 'varchar(100)' },
    apellido_materno: { type: 'varchar(100)' },
    
    // Nuevas columnas del CSV
    sexo: { type: 'varchar(20)' },
    curp: { type: 'varchar(18)', unique: true }, // CURP debería ser único
    estado_civil: { type: 'varchar(50)' },
    fecha_nacimiento: { type: 'date' },
    edad: { type: 'integer' },
    calle_y_numero: { type: 'text' },
    cp: { type: 'varchar(10)' },
    municipio: { type: 'varchar(100)' },
    estado: { type: 'varchar(100)' }, // Estado de residencia
    telefono_fijo: { type: 'varchar(20)' },
    observaciones: { type: 'text' },
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

  // 3. Eliminar la columna antigua
  pgm.dropColumn('alumnos', 'nombre_completo');
};

exports.down = (pgm) => {
  // Revertir los cambios:
  // 1. Añadir de nuevo nombre_completo
  pgm.addColumn('alumnos', {
    nombre_completo: { type: 'varchar(255)' }
  });

  // 2. Eliminar las columnas nuevas
  pgm.dropColumns('alumnos', [
    'nombre', 'apellido_paterno', 'apellido_materno', 'sexo', 'curp', 
    'estado_civil', 'fecha_nacimiento', 'edad', 'calle_y_numero', 'cp', 
    'municipio', 'estado', 'telefono_fijo', 'observaciones', 
    'email_institucional', 'fecha_baja', 'motivo_baja', 'lugar_nacimiento', 
    'estado_nacimiento', 'nacionalidad', 'escuela_procedencia', 
    'escolaridad_procedencia', 'estado_escolaridad', 'fecha_egreso', 
    'fecha_ingreso', 'usuario_sistema_creacion', 'usuario_sistema_actualizacion', 
    'promedio_esc_anterior', 'como_conocio_escuela', 'enlace_expediente_digital'
  ]);

  // 3. Renombrar la columna de email de vuelta
  pgm.renameColumn('alumnos', 'email_personal', 'email_contacto');
};