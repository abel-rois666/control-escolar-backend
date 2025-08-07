// controllers/estadoCuenta.controller.js
const pool = require('../config/database');

const getEstadoDeCuenta = async (req, res) => {
  const { alumnoId } = req.params;

  try {
    // 1. Obtener todos los cargos del alumno, uniendo con conceptos para el nombre
    const cargosQuery = `
      SELECT 
        ca.id, 
        co.nombre_concepto as descripcion, 
        ca.monto_final as monto, 
        ca.created_at as fecha,
        'cargo' as tipo
      FROM cargos ca
      JOIN conceptos co ON ca.concepto_id = co.id
      WHERE ca.alumno_id = $1`;
    const cargosResult = await pool.query(cargosQuery, [alumnoId]);

    // 2. Obtener todos los recibos (pagos) del alumno
    const recibosQuery = `
      SELECT 
        id, 
        'Pago con folio ' || folio as descripcion, 
        monto_total_recibido as monto, 
        fecha_pago as fecha,
        'pago' as tipo
      FROM recibos
      WHERE alumno_id = $1`;
    const recibosResult = await pool.query(recibosQuery, [alumnoId]);

    // 3. Combinar ambos resultados en una sola lista
    const transacciones = [...cargosResult.rows, ...recibosResult.rows];

    // 4. Ordenar la lista combinada por fecha, de la más antigua a la más reciente
    transacciones.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    res.json(transacciones);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getEstadoDeCuenta,
};