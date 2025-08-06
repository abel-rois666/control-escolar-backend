// routes/conceptos.routes.js
const { Router } = require('express');
const {
  getAllConceptos,
  createConcepto,
  getConceptoById,  // <-- Importa las nuevas funciones
  updateConcepto,    // <--
  deleteConcepto,    // <--
} = require('../controllers/conceptos.controller.js');

const router = Router();

// Rutas existentes
router.get('/', getAllConceptos);
router.post('/', createConcepto);

// --- NUEVAS RUTAS ---
// El ':id' es un parámetro que podemos leer en el controlador
router.get('/:id', getConceptoById);
router.put('/:id', updateConcepto);    // PUT es el método estándar para Actualizar
router.delete('/:id', deleteConcepto); // DELETE es para Borrar

module.exports = router;