// routes/recibos.routes.js
const { Router } = require('express');
const { 
    createReciboConDetalles, 
    getReciboById // <-- Importa la nueva función
} = require('../controllers/recibos.controller.js');

const router = Router();

router.post('/', createReciboConDetalles);
router.get('/:id', getReciboById); // <-- Añade esta nueva ruta

module.exports = router;