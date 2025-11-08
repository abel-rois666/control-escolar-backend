// routes/reportes.routes.js
const { Router } = require('express');
const { getIngresosDiarios, getReporteAdeudos } = require('../controllers/reportes.controller.js');
const checkPermission = require('../middleware/checkPermission'); // <-- ASEGÚRATE DE IMPORTARLO

const router = Router();

// El dashboard usa esta ruta. Necesita el permiso 'reportes_ver_ingresos'.
router.get('/ingresos-diarios', checkPermission('reportes_ver_ingresos'), getIngresosDiarios);

// La vista de reportes usa esta ruta. Necesita 'reportes_ver_adeudos'.
router.get('/adeudos', checkPermission('reportes_ver_adeudos'), getReporteAdeudos);

module.exports = router;