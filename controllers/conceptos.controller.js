// controllers/conceptos.controller.js
const pool = require('../config/database'); // Importamos el pool de la base de datos

// --- OBTENER TODOS LOS CONCEPTOS ---
const getAllConceptos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM conceptos ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// --- CREAR UN NUEVO CONCEPTO ---
const createConcepto = async (req, res) => {
  const { nombre_concepto, aplica_beca } = req.body; // Obtenemos los datos del cuerpo de la petición

  if (!nombre_concepto) {
    return res.status(400).json({ error: 'El campo nombre_concepto es requerido' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO conceptos (nombre_concepto, aplica_beca) VALUES ($1, $2) RETURNING *',
      [nombre_concepto, aplica_beca]
    );
    res.status(201).json(result.rows[0]); // Respondemos con el nuevo concepto creado
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// --- OBTENER UN SOLO CONCEPTO POR ID ---
const getConceptoById = async (req, res) => {
  const { id } = req.params; // Obtenemos el ID de los parámetros de la URL
  try {
    const result = await pool.query('SELECT * FROM conceptos WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Concepto con id ${id} no encontrado` });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// --- ACTUALIZAR UN CONCEPTO ---
const updateConcepto = async (req, res) => {
  const { id } = req.params;
  const { nombre_concepto, aplica_beca } = req.body;

  if (!nombre_concepto) {
    return res.status(400).json({ error: 'El campo nombre_concepto es requerido' });
  }

  try {
    const result = await pool.query(
      'UPDATE conceptos SET nombre_concepto = $1, aplica_beca = $2 WHERE id = $3 RETURNING *',
      [nombre_concepto, aplica_beca, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Concepto con id ${id} no encontrado` });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// --- BORRAR UN CONCEPTO ---
const deleteConcepto = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM conceptos WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Concepto con id ${id} no encontrado` });
    }
    
    // Un 204 significa "No Content". Es la respuesta estándar para un borrado exitoso.
    return res.sendStatus(204);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


// Exportamos TODAS las funciones
module.exports = {
  getAllConceptos,
  createConcepto,
  getConceptoById,
  updateConcepto,
  deleteConcepto,
};