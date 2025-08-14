// controllers/consultas.controller.js
const pool = require('../config/database');

// --- OBTENER RECIBOS POR ALUMNO ---
const getRecibosByAlumno = async (req, res) => {
  const { alumnoId } = req.params;
  try {
    const query = `
        SELECT r.id, r.folio, r.monto_total_recibido, r.fecha_pago 
        FROM recibos r
        WHERE r.alumno_id = $1 
        ORDER BY r.fecha_pago DESC`;
    const result = await pool.query(query, [alumnoId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error en getRecibosByAlumno:", err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// --- OBTENER RECIBO POR FOLIO ---
const getReciboByFolio = async (req, res) => {
  const { folio } = req.query;
  if (!folio) {
    return res.status(400).json({ error: 'El folio es requerido' });
  }
  try {
    const result = await pool.query('SELECT * FROM recibos WHERE folio ILIKE $1', [folio]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Recibo con folio ${folio} no encontrado` });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error en getReciboByFolio:", err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getRecibosByAlumno,
  getReciboByFolio,
};