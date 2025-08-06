// routes/alumnos.routes.js
const { Router } = require('express');
const {
  getAllAlumnos,
  getAlumnoById,
  createAlumno,
  updateAlumno,
  deleteAlumno,
} = require('../controllers/alumnos.controller.js');

const router = Router();

router.get('/', getAllAlumnos);
router.post('/', createAlumno);
router.get('/:id', getAlumnoById);
router.put('/:id', updateAlumno);
router.delete('/:id', deleteAlumno);

module.exports = router;