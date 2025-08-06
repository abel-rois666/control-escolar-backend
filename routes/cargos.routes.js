// routes/cargos.routes.js
const { Router } = require('express');
const {
  getCargosByAlumno,
  createCargo,
} = require('../controllers/cargos.controller.js');

// La opción mergeParams: true es la clave para que esta ruta anidada funcione
const router = Router({ mergeParams: true });

// La ruta GET ahora es solo '/', porque el :alumnoId ya viene de la ruta padre
router.get('/', getCargosByAlumno);

// La ruta POST sigue siendo '/', que en el contexto de /api/cargos, funciona bien
router.post('/', createCargo);

module.exports = router;