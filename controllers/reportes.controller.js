// controllers/reportes.controller.js
const pool = require('../config/database');

const getIngresosDiarios = async (req, res) => {
  // Obtenemos el parámetro 'fecha' de la URL. Si no viene, usamos la fecha de hoy.
  const { fecha } = req.query;

  try {
    const query = `
      SELECT
         forma_pago,
         SUM(monto_total_recibido) as total
       FROM recibos
       WHERE fecha_pago = $1
       GROUP BY forma_pago`;

    // Si no se proporciona fecha, PostgreSQL usa CURRENT_DATE.
    // Si se proporciona, usamos esa fecha.
    const targetDate = fecha ? fecha : new Date();

    const result = await pool.query(query, [targetDate]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// --- FUNCIÓN MEJORADA PARA REPORTE DE ADEUDOS ---
const getReporteAdeudos = async (req, res) => {
  const { fechaInicio, fechaFin, sortBy, sortOrder } = req.query;

  if (!fechaInicio || !fechaFin) {
    return res.status(400).json({ error: 'Se requieren fechaInicio y fechaFin' });
  }

  // --- Lógica de Ordenamiento Seguro ---
  // 1. Lista blanca de columnas permitidas para ordenar
  const allowedSortColumns = ['nombre_completo', 'nombre_concepto', 'saldo_pendiente', 'fecha_vencimiento', 'grupo', 'turno'];

  // 2. Valores por defecto si no se especifican
  const orderBy = allowedSortColumns.includes(sortBy) ? sortBy : 'nombre_completo';
  const orderDirection = sortOrder === 'DESC' ? 'DESC' : 'ASC';

  try {
    // 3. Consulta SQL actualizada para incluir las nuevas columnas y el ordenamiento dinámico
    const query = `
      SELECT
         a.nombre_completo,
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
       ORDER BY ${orderBy} ${orderDirection}`; // Inyectamos los valores seguros

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