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


const update = async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    try {
        const result = await pool.query('UPDATE licenciaturas SET nombre = $1 WHERE id = $2 RETURNING *', [nombre, id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Licenciatura no encontrada' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
};


const remove = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM licenciaturas WHERE id = $1', [id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Licenciatura no encontrada' });
        res.sendStatus(204);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getAll, create, update, remove };