// controllers/alumnos.controller.js
const pool = require('../config/database');

const getAllAlumnos = async (req, res) => {
  const { buscar } = req.query;
  try {
    let query = `SELECT id, matricula, estatus, carrera, grado, grupo, turno, email_contacto, telefono_celular, nombre_tutor, porcentaje_beca, lista_de_precios_id, nombre, apellido_paterno, apellido_materno, (nombre || ' ' || apellido_paterno || ' ' || apellido_materno) as nombre_completo FROM alumnos`;
    const params = [];
    if (buscar) {
      query += ` WHERE (nombre || ' ' || apellido_paterno || ' ' || apellido_materno) ILIKE $1 OR matricula ILIKE $1`;
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
    const query = `SELECT id, matricula, estatus, carrera, grado, grupo, turno, email_contacto, telefono_celular, nombre_tutor, porcentaje_beca, lista_de_precios_id, nombre, apellido_paterno, apellido_materno, (nombre || ' ' || apellido_paterno || ' ' || apellido_materno) as nombre_completo FROM alumnos WHERE id = $1`;
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
    estatus, carrera, grado, grupo, turno, email_contacto,
    telefono_celular, nombre_tutor, porcentaje_beca
  } = req.body;

  if (!matricula || !nombre || !apellido_paterno || !lista_de_precios_id) {
    return res.status(400).json({ error: 'Matrícula, nombre, apellido paterno y plan de pago son requeridos' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO alumnos (matricula, nombre, apellido_paterno, apellido_materno, lista_de_precios_id, estatus, carrera, grado, grupo, turno, email_contacto, telefono_celular, nombre_tutor, porcentaje_beca)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [ matricula, nombre, apellido_paterno, apellido_materno, lista_de_precios_id, estatus, carrera, grado, grupo, turno, email_contacto, telefono_celular, nombre_tutor, porcentaje_beca ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { return res.status(400).json({ error: 'La matrícula ya existe.' }); }
    if (err.code === '23503') { return res.status(404).json({ error: 'El plan de pago especificado no existe.' }); }
    console.error(err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateAlumno = async (req, res) => {
    const { id } = req.params;
    const {
        matricula, nombre, apellido_paterno, apellido_materno, lista_de_precios_id, estatus, carrera,
        grado, grupo, turno, email_contacto, telefono_celular, nombre_tutor, porcentaje_beca
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE alumnos SET matricula = $1, nombre = $2, apellido_paterno = $3, apellido_materno = $4, lista_de_precios_id = $5, estatus = $6, carrera = $7,
             grado = $8, grupo = $9, turno = $10, email_contacto = $11, telefono_celular = $12, nombre_tutor = $13, porcentaje_beca = $14
             WHERE id = $15 RETURNING *`,
            [ matricula, nombre, apellido_paterno, apellido_materno, lista_de_precios_id, estatus, carrera, grado, grupo, turno, email_contacto, telefono_celular, nombre_tutor, porcentaje_beca, id ]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: `Alumno con id ${id} no encontrado` });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error interno del servidor' });
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
    const { fecha_vencimiento, ciclo_id } = req.body;

    if (!fecha_vencimiento || !ciclo_id) {
        return res.status(400).json({ error: 'La fecha de vencimiento y el ciclo son requeridos.' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Obtener datos del alumno (plan de precios y beca)
        const alumnoRes = await client.query('SELECT lista_de_precios_id, porcentaje_beca FROM alumnos WHERE id = $1', [alumnoId]);
        if (alumnoRes.rows.length === 0) {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }
        const { lista_de_precios_id, porcentaje_beca } = alumnoRes.rows[0];

        // 2. Obtener los items (conceptos y montos) del plan de precios
        const itemsRes = await client.query(
            `SELECT i.concepto_id, i.monto, c.aplica_beca 
             FROM items_de_la_lista i
             JOIN conceptos c ON i.concepto_id = c.id
             WHERE i.lista_de_precios_id = $1`,
            [lista_de_precios_id]
        );
        const itemsDelPlan = itemsRes.rows;

        // 3. (Opcional pero recomendado) Obtener cargos ya existentes en el ciclo para no duplicar
        const cicloRes = await client.query('SELECT fecha_inicio, fecha_fin FROM ciclos_escolares WHERE id = $1', [ciclo_id]);
        if (cicloRes.rows.length === 0) return res.status(404).json({ error: 'Ciclo escolar no encontrado' });
        const { fecha_inicio, fecha_fin } = cicloRes.rows[0];
        
        const cargosExistentesRes = await client.query(
            `SELECT concepto_id FROM cargos WHERE alumno_id = $1 AND created_at::date BETWEEN $2 AND $3`,
            [alumnoId, fecha_inicio, fecha_fin]
        );
        const conceptosYaCargados = cargosExistentesRes.rows.map(c => c.concepto_id);

        // 4. Recorrer los items y crear los cargos que no existan
        for (const item of itemsDelPlan) {
            if (conceptosYaCargados.includes(item.concepto_id)) {
                continue; // Si ya existe, saltar al siguiente
            }

            const monto_original = parseFloat(item.monto);
            let monto_descuento = 0;
            if (item.aplica_beca && porcentaje_beca > 0) {
                monto_descuento = monto_original * (parseFloat(porcentaje_beca) / 100);
            }
            const monto_final = monto_original - monto_descuento;

            await client.query(
                `INSERT INTO cargos (alumno_id, concepto_id, monto_original, monto_descuento, monto_final, saldo_pendiente, fecha_vencimiento)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [alumnoId, item.concepto_id, monto_original, monto_descuento, monto_final, monto_final, fecha_vencimiento]
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


module.exports = {
  getAllAlumnos,
  getAlumnoById,
  createAlumno,
  updateAlumno,
  deleteAlumno,
  generarCargosDelPlan, 
  };