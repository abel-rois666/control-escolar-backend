// controllers/items.controller.js
const pool = require('../config/database');

// --- AÑADIR UN ITEM A UNA LISTA DE PRECIOS ---
const addItemToLista = async (req, res) => {
  // El ID de la lista viene de los parámetros de la URL
  const { listaId } = req.params;
  // Los datos del item vienen del cuerpo de la petición
  const { concepto_id, monto } = req.body;

  if (!concepto_id || monto === undefined) {
    return res.status(400).json({ error: 'Los campos concepto_id y monto son requeridos' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO items_de_la_lista (lista_de_precios_id, concepto_id, monto) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [listaId, concepto_id, monto]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    // Manejar error de llave foránea (si el concepto o la lista no existen)
    if (err.code === '23503') {
        return res.status(404).json({ error: 'La lista de precios o el concepto no existen.' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// --- ACTUALIZAR EL MONTO DE UN ITEM ---
const updateItemInLista = async (req, res) => {
    const { itemId } = req.params;
    const { monto } = req.body;

    if (monto === undefined) {
        return res.status(400).json({ error: 'El campo monto es requerido' });
    }

    try {
        const result = await pool.query(
            'UPDATE items_de_la_lista SET monto = $1 WHERE id = $2 RETURNING *',
            [monto, itemId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: `Item con id ${itemId} no encontrado` });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// --- ELIMINAR UN ITEM DE UNA LISTA ---
const deleteItemFromLista = async (req, res) => {
    const { itemId } = req.params;
    try {
        const result = await pool.query('DELETE FROM items_de_la_lista WHERE id = $1 RETURNING *', [itemId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: `Item con id ${itemId} no encontrado` });
        }
        res.sendStatus(204);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


module.exports = {
  addItemToLista,
  updateItemInLista,
  deleteItemFromLista,
};