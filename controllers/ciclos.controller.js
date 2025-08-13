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


const update = async (req, res) => {
    const { id } = req.params;
    const { codigo, descripcion, tipo_periodo, fecha_inicio, fecha_fin } = req.body;
    try {
        const result = await pool.query(
            'UPDATE ciclos_escolares SET codigo = $1, descripcion = $2, tipo_periodo = $3, fecha_inicio = $4, fecha_fin = $5 WHERE id = $6 RETURNING *',
            [codigo, descripcion, tipo_periodo, fecha_inicio, fecha_fin, id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Ciclo no encontrado' });
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
};


const remove = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM ciclos_escolares WHERE id = $1', [id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Ciclo no encontrado' });
        res.sendStatus(204);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getAll, create, update, remove };