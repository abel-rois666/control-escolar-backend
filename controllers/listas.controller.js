// controllers/listas.controller.js
const pool = require('../config/database');

// --- OBTENER TODAS LAS LISTAS DE PRECIOS ---
const getAllListas = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM listas_de_precios ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// --- OBTENER UNA LISTA Y SUS ITEMS POR ID ---
const getListaById = async (req, res) => {
  const { id } = req.params;
  try {
    // Obtenemos la información de la lista de precios
    const listaResult = await pool.query('SELECT * FROM listas_de_precios WHERE id = $1', [id]);

    if (listaResult.rows.length === 0) {
      return res.status(404).json({ error: `Lista de precios con id ${id} no encontrada` });
    }

    // Obtenemos los items asociados a esa lista, uniendo tablas para obtener los nombres de los conceptos
    const itemsResult = await pool.query(
      `SELECT 
         items.id, 
         items.concepto_id, 
         conceptos.nombre_concepto, 
         items.monto 
       FROM items_de_la_lista AS items
       JOIN conceptos ON conceptos.id = items.concepto_id
       WHERE items.lista_de_precios_id = $1
       ORDER BY items.id ASC`,
      [id]
    );

    // Combinamos los resultados en un solo objeto de respuesta
    const respuesta = {
      ...listaResult.rows[0],
      items: itemsResult.rows,
    };

    res.json(respuesta);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// --- CREAR UNA NUEVA LISTA DE PRECIOS ---
// Nota: Crear una lista es un proceso de dos pasos. 1) Crear la lista. 2) Añadirle items.
// Por ahora, solo crearemos la lista vacía.
const createLista = async (req, res) => {
  const { nombre_lista } = req.body;
  if (!nombre_lista) {
    return res.status(400).json({ error: 'El campo nombre_lista es requerido' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO listas_de_precios (nombre_lista) VALUES ($1) RETURNING *',
      [nombre_lista]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// --- ACTUALIZAR UNA LISTA DE PRECIOS ---
const updateLista = async (req, res) => {
    const { id } = req.params;
    const { nombre_lista } = req.body;
    if (!nombre_lista) {
        return res.status(400).json({ error: 'El campo nombre_lista es requerido' });
    }
    try {
        const result = await pool.query(
            'UPDATE listas_de_precios SET nombre_lista = $1 WHERE id = $2 RETURNING *',
            [nombre_lista, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: `Lista de precios con id ${id} no encontrada` });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// --- BORRAR UNA LISTA DE PRECIOS ---
const deleteLista = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM listas_de_precios WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: `Lista de precios con id ${id} no encontrada` });
        }
        res.sendStatus(204);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


module.exports = {
  getAllListas,
  getListaById,
  createLista,
  updateLista,
  deleteLista,
};