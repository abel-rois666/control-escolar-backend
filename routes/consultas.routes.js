// routes/consultas.routes.js
const { Router } = require('express');
const { getRecibosByAlumno, getReciboByFolio } = require('../controllers/consultas.controller.js');
const router = Router();

// Ruta para buscar recibos por el ID de un alumno
router.get('/alumnos/:alumnoId', getRecibosByAlumno);

// Ruta para buscar un recibo por su folio
router.get('/folio', getReciboByFolio);

module.exports = router;