// routes/listas.routes.js
const { Router } = require('express');
const {
  getAllListas,
  getListaById,
  createLista,
  updateLista,
  deleteLista,
} = require('../controllers/listas.controller.js');

const router = Router();
const itemsRouter = require('./items.routes.js');

router.get('/', getAllListas);
router.post('/', createLista);
router.get('/:id', getListaById);
router.put('/:id', updateLista);
router.delete('/:id', deleteLista);

// Cuando una ruta coincida con /:listaId/items, pasa el control al enrutador de items
router.use('/:listaId/items', itemsRouter);

module.exports = router;