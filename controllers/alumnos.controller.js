const fs = require('fs');
const csv = require('csv-parser');
const pool = require('../database'); // Asegúrate que la ruta a tu DB config sea correcta

// Función para convertir llaves de CSV (mayúsculas, espacios) a llaves de DB (minúsculas, guion bajo)
const normalizeKeys = (obj) => {
  const newObj = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const normalizedKey = key.toLowerCase().replace(/ /g, '_');
      newObj[normalizedKey] = obj[key] || null; // Asigna null si el valor es vacío
    }
  }
  return newObj;
};

// Función para parsear fechas
const parseDate = (dateString) => {
  if (!dateString) return null;
  // Intenta parsear fechas en formato DD/MM/YYYY
  const parts = dateString.split('/');
  if (parts.length === 3) {
    // Formato: DD/MM/YYYY
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  }
  // Intenta parsear como fecha estándar si no es el formato esperado
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

// ... (tus funciones existentes: getAlumnos, getAlumnoById, createAlumno, etc.) ...

const getAlumnos = async (req, res) => {
  const { buscar } = req.query;
  try {
    let query = `
      SELECT 
        id, matricula, estatus, carrera, grado, grupo, turno, 
        email_personal, telefono_celular, nombre_tutor, porcentaje_beca, 
        lista_de_precios_id, nombre, apellido_paterno, apellido_materno,
        (nombre || ' ' || apellido_paterno || ' ' || apellido_materno) as nombre_completo,
        curp, estado_civil, fecha_nacimiento, edad, calle_y_numero, cp, municipio,
        estado, telefono_fijo, observaciones, email_institucional, fecha_baja,
        motivo_baja, lugar_nacimiento, estado_nacimiento, nacionalidad,
        escuela_procedencia, escolaridad_procedencia, estado_escolaridad,
        fecha_egreso, fecha_ingreso, usuario_sistema_creacion,
        usuario_sistema_actualizacion, promedio_esc_anterior,
        como_conocio_escuela, enlace_expediente_digital
      FROM alumnos
    `;
    const params = [];
    if (buscar) {
      query += ` WHERE (nombre || ' ' || apellido_paterno || ' ' || apellido_materno) ILIKE $1 OR matricula ILIKE $1 OR curp ILIKE $1`;
      params.push(`%${buscar}%`);
    }
    query += ' ORDER BY apellido_paterno ASC, apellido_materno ASC, nombre ASC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getAlumnoById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT 
        id, matricula, estatus, carrera, grado, grupo, turno, 
        email_personal, telefono_celular, nombre_tutor, porcentaje_beca, 
        lista_de_precios_id, nombre, apellido_paterno, apellido_materno,
        (nombre || ' ' || apellido_paterno || ' ' || apellido_materno) as nombre_completo,
        curp, estado_civil, fecha_nacimiento, edad, calle_y_numero, cp, municipio,
        estado, telefono_fijo, observaciones, email_institucional, fecha_baja,
        motivo_baja, lugar_nacimiento, estado_nacimiento, nacionalidad,
        escuela_procedencia, escolaridad_procedencia, estado_escolaridad,
        fecha_egreso, fecha_ingreso, usuario_sistema_creacion,
        usuario_sistema_actualizacion, promedio_esc_anterior,
        como_conocio_escuela, enlace_expediente_digital
      FROM alumnos 
      WHERE id = $1`;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Alumno con id ${id} no encontrado` });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createAlumno = async (req, res) => {
  const {
    matricula, nombre, apellido_paterno, apellido_materno, lista_de_precios_id,
    estatus, carrera, grado, grupo, turno, email_personal,
    telefono_celular, nombre_tutor, porcentaje_beca, curp, estado_civil,
    fecha_nacimiento, edad, calle_y_numero, cp, municipio, estado,
    telefono_fijo, observaciones, email_institucional, fecha_baja, motivo_baja,
    lugar_nacimiento, estado_nacimiento, nacionalidad, escuela_procedencia,
    escolaridad_procedencia, estado_escolaridad, fecha_egreso, fecha_ingreso,
    usuario_sistema_creacion, usuario_sistema_actualizacion, promedio_esc_anterior,
    como_conocio_escuela, enlace_expediente_digital
  } = req.body;

  if (!matricula || !nombre || !apellido_paterno || !lista_de_precios_id) {
    return res.status(400).json({ error: 'Matrícula, nombre, apellido paterno y plan de pago son requeridos' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO alumnos (
        matricula, nombre, apellido_paterno, apellido_materno, estatus, carrera, grado, grupo, turno, 
        email_personal, telefono_celular, nombre_tutor, porcentaje_beca, lista_de_precios_id,
        curp, estado_civil, fecha_nacimiento, edad, calle_y_numero, cp, municipio, estado, 
        telefono_fijo, observaciones, email_institucional, fecha_baja, motivo_baja, 
        lugar_nacimiento, estado_nacimiento, nacionalidad, escuela_procedencia, 
        escolaridad_procedencia, estado_escolaridad, fecha_egreso, fecha_ingreso, 
        usuario_sistema_creacion, usuario_sistema_actualizacion, promedio_esc_anterior, 
        como_conocio_escuela, enlace_expediente_digital
      ) 
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 
        $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, 
        $33, $34, $35, $36, $37, $38, $39
      )
      RETURNING *`,
      [
        matricula, nombre, apellido_paterno, apellido_materno, estatus, carrera, grado, grupo, turno,
        email_personal, telefono_celular, nombre_tutor, porcentaje_beca, lista_de_precios_id,
        curp, estado_civil, parseDate(fecha_nacimiento), edad ? parseInt(edad) : null, calle_y_numero, cp, municipio, estado,
        telefono_fijo, observaciones, email_institucional, parseDate(fecha_baja), motivo_baja,
        lugar_nacimiento, estado_nacimiento, nacionalidad, escuela_procedencia,
        escolaridad_procedencia, estado_escolaridad, parseDate(fecha_egreso), parseDate(fecha_ingreso),
        usuario_sistema_creacion, usuario_sistema_actualizacion, 
        promedio_esc_anterior ? parseFloat(promedio_esc_anterior) : null,
        como_conocio_escuela, enlace_expediente_digital
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // Unique violation
      return res.status(409).json({ error: `La matrícula o CURP o email institucional ya existe: ${err.detail}` });
    }
    if (err.code === '23503') { // Foreign key violation
      return res.status(404).json({ error: 'El plan de pago (lista_de_precios_id) especificado no existe.' });
    }
    console.error(err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateAlumno = async (req, res) => {
    const { id } = req.params;
    const {
        matricula, nombre, apellido_paterno, apellido_materno, lista_de_precios_id, estatus, carrera,
        grado, grupo, turno, email_personal, telefono_celular, nombre_tutor, porcentaje_beca,
        curp, estado_civil, fecha_nacimiento, edad, calle_y_numero, cp, municipio, estado,
        telefono_fijo, observaciones, email_institucional, fecha_baja, motivo_baja,
        lugar_nacimiento, estado_nacimiento, nacionalidad, escuela_procedencia,
        escolaridad_procedencia, estado_escolaridad, fecha_egreso, fecha_ingreso,
        usuario_sistema_creacion, usuario_sistema_actualizacion, promedio_esc_anterior,
        como_conocio_escuela, enlace_expediente_digital
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE alumnos SET 
                matricula = $1, nombre = $2, apellido_paterno = $3, apellido_materno = $4, lista_de_precios_id = $5, 
                estatus = $6, carrera = $7, grado = $8, grupo = $9, turno = $10, email_personal = $11, 
                telefono_celular = $12, nombre_tutor = $13, porcentaje_beca = $14, curp = $15, estado_civil = $16, 
                fecha_nacimiento = $17, edad = $18, calle_y_numero = $19, cp = $20, municipio = $21, estado = $22, 
                telefono_fijo = $23, observaciones = $24, email_institucional = $25, fecha_baja = $26, 
                motivo_baja = $27, lugar_nacimiento = $28, estado_nacimiento = $29, nacionalidad = $30, 
                escuela_procedencia = $31, escolaridad_procedencia = $32, estado_escolaridad = $33, 
                fecha_egreso = $34, fecha_ingreso = $35, usuario_sistema_creacion = $36, 
                usuario_sistema_actualizacion = $37, promedio_esc_anterior = $38, como_conocio_escuela = $39, 
                enlace_expediente_digital = $40, updated_at = NOW()
            WHERE id = $41 RETURNING *`,
            [
                matricula, nombre, apellido_paterno, apellido_materno, lista_de_precios_id, estatus, carrera, 
                grado, grupo, turno, email_personal, telefono_celular, nombre_tutor, porcentaje_beca,
                curp, estado_civil, parseDate(fecha_nacimiento), edad ? parseInt(edad) : null, calle_y_numero, cp, municipio, estado,
                telefono_fijo, observaciones, email_institucional, parseDate(fecha_baja), motivo_baja,
                lugar_nacimiento, estado_nacimiento, nacionalidad, escuela_procedencia,
                escolaridad_procedencia, estado_escolaridad, parseDate(fecha_egreso), parseDate(fecha_ingreso),
                usuario_sistema_creacion, usuario_sistema_actualizacion, 
                promedio_esc_anterior ? parseFloat(promedio_esc_anterior) : null,
                como_conocio_escuela, enlace_expediente_digital,
                id
            ]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: `Alumno con id ${id} no encontrado` });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error interno del servidor', details: err.message });
    }
};


const deleteAlumno = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM alumnos WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: `Alumno con id ${id} no encontrado` });
        }
        res.sendStatus(204);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const generarCargosDelPlan = async (req, res) => {
    const { id: alumnoId } = req.params;
    // Ahora esperamos un arreglo de 'cargos' con sus fechas
    const { ciclo_id, cargos: cargosParaCrear } = req.body;

    if (!ciclo_id || !cargosParaCrear || !Array.isArray(cargosParaCrear)) {
        return res.status(400).json({ error: 'El ciclo y la lista de cargos son requeridos.' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const alumnoRes = await client.query('SELECT lista_de_precios_id, porcentaje_beca FROM alumnos WHERE id = $1', [alumnoId]);
        if (alumnoRes.rows.length === 0) {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }
        const { lista_de_precios_id, porcentaje_beca } = alumnoRes.rows[0];

        const itemsRes = await client.query(
            `SELECT i.concepto_id, i.monto, c.aplica_beca 
             FROM items_de_la_lista i
             JOIN conceptos c ON i.concepto_id = c.id
             WHERE i.lista_de_precios_id = $1`,
            [lista_de_precios_id]
        );
        // Usamos un Map para buscar montos fácilmente
        const mapaItemsDelPlan = new Map(itemsRes.rows.map(i => [i.concepto_id, i]));
        
        const cicloRes = await client.query('SELECT fecha_inicio, fecha_fin FROM ciclos_escolares WHERE id = $1', [ciclo_id]);
        if (cicloRes.rows.length === 0) return res.status(404).json({ error: 'Ciclo escolar no encontrado' });
        const { fecha_inicio, fecha_fin } = cicloRes.rows[0];
        
        const cargosExistentesRes = await client.query(
            `SELECT concepto_id FROM cargos WHERE alumno_id = $1 AND created_at::date BETWEEN $2 AND $3`,
            [alumnoId, fecha_inicio, fecha_fin]
        );
        const conceptosYaCargados = cargosExistentesRes.rows.map(c => c.concepto_id);

        // Recorremos el arreglo que nos llega del frontend
        for (const cargo of cargosParaCrear) {
            if (!cargo.fecha_vencimiento || !cargo.concepto_id) continue; // Ignorar si no tiene fecha
            if (conceptosYaCargados.includes(cargo.concepto_id)) continue;

            const itemDelPlan = mapaItemsDelPlan.get(cargo.concepto_id);
            if (!itemDelPlan) continue; // Si el concepto no está en el plan, lo ignoramos

            const monto_original = parseFloat(itemDelPlan.monto);
            let monto_descuento = 0;
            if (itemDelPlan.aplica_beca && porcentaje_beca > 0) {
                monto_descuento = monto_original * (parseFloat(porcentaje_beca) / 100);
            }
            const monto_final = monto_original - monto_descuento;

            await client.query(
                `INSERT INTO cargos (alumno_id, concepto_id, monto_original, monto_descuento, monto_final, saldo_pendiente, fecha_vencimiento)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [alumnoId, cargo.concepto_id, monto_original, monto_descuento, monto_final, monto_final, cargo.fecha_vencimiento]
            );
        }

        await client.query('COMMIT');
        res.status(201).json({ message: 'Cargos del plan generados exitosamente.' });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error en generarCargosDelPlan:", err.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        client.release();
    }
};

// ============ NUEVA FUNCIÓN PARA CARGA MASIVA ============

const cargaMasivaAlumnos = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No se proporcionó ningún archivo." });
  }

  const filePath = req.file.path;
  const results = [];
  const errors = [];
  let processedCount = 0;
  let successCount = 0;
  let skippedCount = 0;
  
  const client = await pool.connect();

  try {
    // Función para procesar la data (que viene de un CSV o JSON)
    const processData = async (data) => {
      try {
        await client.query('BEGIN'); // Iniciar transacción

        for (const [index, item] of data.entries()) {
          const rowNum = index + 2; // +1 para índice base 1, +1 para la cabecera
          const alumno = normalizeKeys(item);

          // Validación básica
          if (!alumno.matricula || !alumno.nombre || !alumno.apellido_paterno || !alumno.lista_de_precios_id) {
            errors.push(`Fila ${rowNum}: Faltan datos obligatorios (matrícula, nombre, apellido paterno, lista_de_precios_id).`);
            skippedCount++;
            continue;
          }

          // Convertir tipos de datos
          const p_beca = parseFloat(alumno.porcentaje_beca);
          const p_anterior = parseFloat(alumno.promedio_esc_anterior);
          const f_nacimiento = parseDate(alumno.fecha_nacimiento);
          const f_egreso = parseDate(alumno.fecha_egreso);
          const f_ingreso = parseDate(alumno.fecha_ingreso);
          const f_baja = parseDate(alumno.fecha_baja);
          const edad = alumno.edad ? parseInt(alumno.edad, 10) : null;
          const grado = alumno.grado ? parseInt(alumno.grado, 10) : null;
          const lista_precios = parseInt(alumno.lista_de_precios_id, 10);

          if (isNaN(lista_precios)) {
            errors.push(`Fila ${rowNum}: 'lista_de_precios_id' inválido para matrícula ${alumno.matricula}.`);
            skippedCount++;
            continue;
          }

          const query = `
            INSERT INTO alumnos (
              matricula, nombre, apellido_paterno, apellido_materno, estatus, 
              carrera, grado, grupo, turno, email_personal, 
              telefono_celular, nombre_tutor, porcentaje_beca, lista_de_precios_id,
              curp, estado_civil, fecha_nacimiento, edad, calle_y_numero, cp, municipio, estado, 
              telefono_fijo, observaciones, email_institucional, fecha_baja, motivo_baja, 
              lugar_nacimiento, estado_nacimiento, nacionalidad, escuela_procedencia, 
              escolaridad_procedencia, estado_escolaridad, fecha_egreso, fecha_ingreso, 
              usuario_sistema_creacion, usuario_sistema_actualizacion, promedio_esc_anterior, 
              como_conocio_escuela, enlace_expediente_digital
            ) 
            VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
              $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 
              $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, 
              $31, $32, $33, $34, $35, $36, $37, $38, $39, $40
            )
            ON CONFLICT (matricula) DO UPDATE SET
              nombre = EXCLUDED.nombre,
              apellido_paterno = EXCLUDED.apellido_paterno,
              apellido_materno = EXCLUDED.apellido_materno,
              estatus = EXCLUDED.estatus,
              carrera = EXCLUDED.carrera,
              grado = EXCLUDED.grado,
              grupo = EXCLUDED.grupo,
              turno = EXCLUDED.turno,
              email_personal = EXCLUDED.email_personal,
              telefono_celular = EXCLUDED.telefono_celular,
              nombre_tutor = EXCLUDED.nombre_tutor,
              porcentaje_beca = EXCLUDED.porcentaje_beca,
              lista_de_precios_id = EXCLUDED.lista_de_precios_id,
              curp = EXCLUDED.curp,
              estado_civil = EXCLUDED.estado_civil,
              fecha_nacimiento = EXCLUDED.fecha_nacimiento,
              edad = EXCLUDED.edad,
              calle_y_numero = EXCLUDED.calle_y_numero,
              cp = EXCLUDED.cp,
              municipio = EXCLUDED.municipio,
_estado = EXCLUDED.estado,
              telefono_fijo = EXCLUDED.telefono_fijo,
              observaciones = EXCLUDED.observaciones,
              email_institucional = EXCLUDED.email_institucional,
              fecha_baja = EXCLUDED.fecha_baja,
              motivo_baja = EXCLUDED.motivo_baja,
              lugar_nacimiento = EXCLUDED.lugar_nacimiento,
              estado_nacimiento = EXCLUDED.estado_nacimiento,
              nacionalidad = EXCLUDED.nacionalidad,
              escuela_procedencia = EXCLUDED.escuela_procedencia,
              escolaridad_procedencia = EXCLUDED.escolaridad_procedencia,
              estado_escolaridad = EXCLUDED.estado_escolaridad,
              fecha_egreso = EXCLUDED.fecha_egreso,
              fecha_ingreso = EXCLUDED.fecha_ingreso,
              usuario_sistema_creacion = EXCLUDED.usuario_sistema_creacion,
              usuario_sistema_actualizacion = EXCLUDED.usuario_sistema_actualizacion,
              promedio_esc_anterior = EXCLUDED.promedio_esc_anterior,
              como_conocio_escuela = EXCLUDED.como_conocio_escuela,
              enlace_expediente_digital = EXCLUDED.enlace_expediente_digital;
          `;
          
          try {
            await client.query(query, [
              alumno.matricula, alumno.nombre, alumno.apellido_paterno, alumno.apellido_materno, alumno.status || 'Activo',
              alumno.carrera, grado, alumno.grupo, alumno.turno, alumno.email_personal,
              alumno.telefono_celular, alumno.nombre_tutor, isNaN(p_beca) ? 0.0 : p_beca, lista_precios,
              alumno.curp, alumno.estado_civil, f_nacimiento, edad, alumno.calle_y_numero, alumno.cp,
              alumno.municipio, alumno.estado, alumno.telefono_fijo, alumno.observaciones, alumno.email_institucional,
              f_baja, alumno.motivo_baja, alumno.lugar_nacimiento, alumno.estado_nacimiento, alumno.nacionalidad,
              alumno.escuela_procedencia, alumno.escolaridad_procedencia, alumno.estado_escolaridad, f_egreso, f_ingreso,
              alumno.usuario_sistema_creacion, alumno.usuario_sistema_actualizacion, isNaN(p_anterior) ? null : p_anterior,
              alumno.como_conocio_a_la_escuela, // Corregido de acuerdo al CSV
              alumno.enlace_a_expediente_digital // Corregido de acuerdo al CSV
            ]);
            successCount++;
          } catch (err) {
            console.error(`Error en fila ${rowNum}: ${err.message}`);
            errors.push(`Fila ${rowNum} (Matrícula: ${alumno.matricula}): ${err.message}`);
            skippedCount++;
          }
          processedCount++;
        }

        await client.query('COMMIT'); // Finalizar transacción
        res.status(201).json({
          message: `Importación completada. ${successCount} registros procesados, ${skippedCount} omitidos.`,
          errors: errors
        });

      } catch (error) {
        await client.query('ROLLBACK'); // Revertir en caso de error
        console.error('Error en la transacción de carga masiva:', error);
        res.status(500).json({ message: 'Error en el servidor durante la transacción.', error: error.message });
      } finally {
        client.release();
        fs.unlinkSync(filePath); // Eliminar el archivo temporal
      }
    };

    // Determinar el tipo de archivo y procesar
    if (req.file.mimetype === 'text/csv') {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          processData(results);
        })
        .on('error', (err) => {
          fs.unlinkSync(filePath);
          res.status(500).json({ message: 'Error al procesar el archivo CSV.', error: err.message });
        });
    } else if (req.file.mimetype === 'application/json') {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          fs.unlinkSync(filePath);
          return res.status(500).json({ message: 'Error al leer el archivo JSON.' });
        }
        try {
          const jsonData = JSON.parse(data);
          if (!Array.isArray(jsonData)) {
            fs.unlinkSync(filePath);
            return res.status(400).json({ message: 'El JSON debe ser un array de objetos.' });
          }
          processData(jsonData);
        } catch (parseError) {
          fs.unlinkSync(filePath);
          console.error('Error parseando JSON:', parseError);
          return res.status(400).json({ message: 'Archivo JSON mal formateado.', error: parseError.message });
        }
      });
    } else {
      fs.unlinkSync(filePath); // Eliminar archivo no soportado
      return res.status(400).json({ message: 'Formato de archivo no soportado. Sube CSV o JSON.' });
    }

  } catch (error) {
    console.error('Error en cargaMasiva:', error);
    if (filePath) {
      try {
        fs.unlinkSync(filePath); // Asegurarse de borrar el archivo si hay un error
      } catch (e) {
        console.error("Error eliminando archivo temporal:", e);
      }
    }
    res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
  }
};


module.exports = {
  getAlumnos,
  getAlumnoById,
  createAlumno,
  updateAlumno,
  deleteAlumno,
  generarCargosDelPlan,
  cargaMasivaAlumnos // Exportar la nueva función
};