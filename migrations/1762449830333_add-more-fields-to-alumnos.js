/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns('alumnos', {
    sexo: { type: 'varchar(20)' },
    matricula_adicional: { type: 'varchar(50)' },
    curp: { type: 'varchar(18)' },
    estado_civil: { type: 'varchar(50)' },
    fecha_nacimiento: { type: 'date' },
    edad: { type: 'integer' },
    calle_y_numero: { type: 'text' },
    cp: { type: 'varchar(10)' },
    municipio: { type: 'varchar(100)' },
    estado: { type: 'varchar(100)' },
    telefono_fijo: { type: 'varchar(20)' },
    observaciones: { type: 'text' },
    email_institucional: { type: 'varchar(255)' },
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
    // created_at ya existe, usamos fechacreacion del CSV para él si es necesario al importar
    // Dejaremos que la base de datos maneje updated_at
    // renombraremos email_contacto a email_personal
    usuario_sistema_creacion: { type: 'varchar(100)' },
    usuario_sistema_actualizacion: { type: 'varchar(100)' },
    promedio_esc_anterior: { type: 'decimal(5, 2)' },
    como_conocio_escuela: { type: 'varchar(255)' },
    enlace_expediente_digital: { type: 'text' }
  });

  // Renombrar 'email_contacto' a 'email_personal' para que coincida con el CSV
  pgm.renameColumn('alumnos', 'email_contacto', 'email_personal');
};

exports.down = (pgm) => {
  pgm.dropColumns('alumnos', [
    'sexo', 'matricula_adicional', 'curp', 'estado_civil', 'fecha_nacimiento', 
    'edad', 'calle_y_numero', 'cp', 'municipio', 'estado', 'telefono_fijo', 
    'observaciones', 'email_institucional', 'fecha_baja', 'motivo_baja', 
    'lugar_nacimiento', 'estado_nacimiento', 'nacionalidad', 'escuela_procedencia', 
    'escolaridad_procedencia', 'estado_escolaridad', 'fecha_egreso', 'fecha_ingreso',
    'usuario_sistema_creacion', 'usuario_sistema_actualizacion', 'promedio_esc_anterior',
    'como_conocio_escuela', 'enlace_expediente_digital'
  ]);
  
  pgm.renameColumn('alumnos', 'email_personal', 'email_contacto');
};