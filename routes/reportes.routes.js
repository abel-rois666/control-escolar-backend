// routes/reportes.routes.js
const { Router } = require('express');
const { getIngresosDiarios, getReporteAdeudos } = require('../controllers/reportes.controller.js');

const router = Router();

router.get('/ingresos-diarios', getIngresosDiarios);
router.get('/adeudos', getReporteAdeudos);

module.exports = router;