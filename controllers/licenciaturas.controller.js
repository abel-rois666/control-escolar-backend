const pool = require('../config/database');

const getAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM licenciaturas ORDER BY nombre ASC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const create = async (req, res) => {
  const { nombre } = req.body;
  try {
    const result = await pool.query('INSERT INTO licenciaturas (nombre) VALUES ($1) RETURNING *', [nombre]);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getAll, create };