// routes/items.routes.js
const { Router } = require('express');
const {
  addItemToLista,
  updateItemInLista,
  deleteItemFromLista,
} = require('../controllers/items.controller.js');

// La opción mergeParams nos permite acceder a parámetros de otras rutas, como :listaId
const router = Router({ mergeParams: true });

// La ruta raíz '/' aquí en realidad es '/api/listas-precios/:listaId/items'
router.post('/', addItemToLista);

// Estas rutas necesitarán el ID del item específico
router.put('/:itemId', updateItemInLista);
router.delete('/:itemId', deleteItemFromLista);

module.exports = router;