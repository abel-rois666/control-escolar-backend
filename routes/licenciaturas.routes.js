const { Router } = require('express');
const { getAll, create, update, remove } = require('../controllers/licenciaturas.controller.js');
const router = Router();

router.get('/', getAll);
router.post('/', create);
router.put('/:id', update); // <-- NUEVA RUTA
router.delete('/:id', remove); // <-- NUEVA RUTA

module.exports = router;