// controllers/reportes.controller.js
const pool = require('../config/database');

const getIngresosDiarios = async (req, res) => {
  const { fecha } = req.query;

  try {
    const query = `
      SELECT
         forma_pago,
         SUM(monto_total_recibido) as total
       FROM recibos
       WHERE fecha_pago = $1
       GROUP BY forma_pago`;

    const targetDate = fecha ? fecha : new Date();
    const result = await pool.query(query, [targetDate]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getReporteAdeudos = async (req, res) => {
  const { fechaInicio, fechaFin, sortBy, sortOrder } = req.query;

  if (!fechaInicio || !fechaFin) {
    return res.status(400).json({ error: 'Se requieren fechaInicio y fechaFin' });
  }

  const allowedSortColumns = ['nombre_completo', 'nombre_concepto', 'saldo_pendiente', 'fecha_vencimiento', 'grupo', 'turno'];
  
  // Lógica de ordenamiento corregida
  let orderBy;
  const selectedSort = allowedSortColumns.includes(sortBy) ? sortBy : 'nombre_completo';
  
  if (selectedSort === 'nombre_completo') {
    // Ordenamos por los campos individuales para un ordenamiento alfabético correcto
    orderBy = `a.apellido_paterno, a.apellido_materno, a.nombre`;
  } else {
    orderBy = selectedSort;
  }
  
  const orderDirection = sortOrder === 'DESC' ? 'DESC' : 'ASC';

  try {
    // Consulta SQL corregida
    const query = `
      SELECT
         (a.apellido_paterno || ' ' || a.apellido_materno || ' ' || a.nombre) as nombre_completo,
         a.grupo,
         a.turno,
         co.nombre_concepto,
         ca.saldo_pendiente,
         ca.fecha_vencimiento
       FROM cargos AS ca
       JOIN alumnos AS a ON ca.alumno_id = a.id
       JOIN conceptos AS co ON ca.concepto_id = co.id
       WHERE
         ca.saldo_pendiente > 0
         AND ca.fecha_vencimiento BETWEEN $1 AND $2
       ORDER BY ${orderBy} ${orderDirection}`;

    const result = await pool.query(query, [fechaInicio, fechaFin]);
    const totalAdeudo = result.rows.reduce((sum, cargo) => sum + parseFloat(cargo.saldo_pendiente), 0);

    res.json({
      detalles: result.rows,
      totalAdeudo: totalAdeudo.toFixed(2)
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getIngresosDiarios,
  getReporteAdeudos,
};