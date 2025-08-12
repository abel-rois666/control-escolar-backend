const pool = require('../config/database');

const getAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ciclos_escolares ORDER BY fecha_inicio DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const create = async (req, res) => {
  const { codigo, descripcion, tipo_periodo, fecha_inicio, fecha_fin } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO ciclos_escolares (codigo, descripcion, tipo_periodo, fecha_inicio, fecha_fin) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [codigo, descripcion, tipo_periodo, fecha_inicio, fecha_fin]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getAll, create };