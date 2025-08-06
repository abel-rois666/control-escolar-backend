// controllers/cargos.controller.js
const pool = require('../config/database');

// --- OBTENER TODOS LOS CARGOS DE UN ALUMNO ESPECÍFICO ---
const getCargosByAlumno = async (req, res) => {
  const { alumnoId } = req.params;
  try {
    const result = await pool.query(
        `SELECT c.*, co.nombre_concepto 
         FROM cargos AS c
         JOIN conceptos AS co ON c.concepto_id = co.id
         WHERE c.alumno_id = $1 
         ORDER BY c.created_at DESC`, 
        [alumnoId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// --- CREAR UN NUEVO CARGO PARA UN ALUMNO ---
const createCargo = async (req, res) => {
  const { alumno_id, concepto_id, fecha_vencimiento } = req.body;

  if (!alumno_id || !concepto_id) {
    return res.status(400).json({ error: 'alumno_id y concepto_id son requeridos' });
  }

  try {
    // 1. Obtener datos del alumno (lista de precios y beca)
    const alumnoRes = await pool.query('SELECT lista_de_precios_id, porcentaje_beca FROM alumnos WHERE id = $1', [alumno_id]);
    if (alumnoRes.rows.length === 0) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }
    const { lista_de_precios_id, porcentaje_beca } = alumnoRes.rows[0];

    // 2. Obtener datos del concepto (si aplica beca)
    const conceptoRes = await pool.query('SELECT aplica_beca FROM conceptos WHERE id = $1', [concepto_id]);
    if (conceptoRes.rows.length === 0) {
        return res.status(404).json({ error: 'Concepto no encontrado' });
    }
    const { aplica_beca } = conceptoRes.rows[0];

    // 3. Obtener el monto base de la lista de precios
    const itemRes = await pool.query(
        'SELECT monto FROM items_de_la_lista WHERE lista_de_precios_id = $1 AND concepto_id = $2',
        [lista_de_precios_id, concepto_id]
    );
    if (itemRes.rows.length === 0) {
        return res.status(404).json({ error: 'El concepto no tiene un precio definido para la lista de este alumno.' });
    }
    const monto_original = parseFloat(itemRes.rows[0].monto);

    // 4. Calcular descuento y monto final
    let monto_descuento = 0;
    if (aplica_beca && porcentaje_beca > 0) {
        monto_descuento = monto_original * (parseFloat(porcentaje_beca) / 100);
    }
    const monto_final = monto_original - monto_descuento;

    // 5. Insertar el nuevo cargo en la base de datos
    const result = await pool.query(
      `INSERT INTO cargos (alumno_id, concepto_id, monto_original, monto_descuento, monto_final, saldo_pendiente, fecha_vencimiento)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [alumno_id, concepto_id, monto_original, monto_descuento, monto_final, monto_final, fecha_vencimiento]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getCargosByAlumno,
  createCargo,
};