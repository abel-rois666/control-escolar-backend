// routes/estadoCuenta.routes.js
const { Router } = require('express');
const { getEstadoDeCuenta } = require('../controllers/estadoCuenta.controller.js');

// mergeParams es necesario para leer el :alumnoId de la ruta padre
const router = Router({ mergeParams: true });

router.get('/', getEstadoDeCuenta);

module.exports = router;