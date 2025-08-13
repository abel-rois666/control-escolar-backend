const { Router } = require('express');
const { getAll, create, update, remove } = require('../controllers/ciclos.controller.js');
const router = Router();

router.get('/', getAll);
router.post('/', create);
router.put('/:id', update); 
router.delete('/:id', remove); 

module.exports = router;