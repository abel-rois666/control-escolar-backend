const { Router } = require('express');
const router = Router();
const {
  getAlumnos,
  getAlumnoById,
  createAlumno,
  updateAlumno,
  deleteAlumno,
  generarCargosDelPlan,
  cargaMasivaAlumnos // Importar la nueva función
} = require('../controllers/alumnos.controller');
const upload = require('../middleware/upload'); // Importar el middleware

// Rutas existentes
router.get('/', getAlumnos);
router.get('/:id', getAlumnoById);
router.post('/', createAlumno);
router.put('/:id', updateAlumno);
router.delete('/:id', deleteAlumno);
router.post('/:id/generar-cargos', generarCargosDelPlan);

// Nueva ruta para carga masiva
// El 'archivo' debe coincidir con el nombre del campo en el FormData del frontend
router.post('/upload', upload.single('archivo'), cargaMasivaAlumnos);

module.exports = router;