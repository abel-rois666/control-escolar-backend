// routes/usuarios.routes.js
const { Router } = require('express');
const {
  getAllUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  getUsuarioById // <-- AÑADIDO para el formulario de edición
} = require('../controllers/usuarios.controller.js');

const router = Router();

// La ruta base '/api/usuarios' ya está protegida por 'config_ver_usuarios' en index.js

// GET /api/usuarios
router.get('/', getAllUsuarios);

// GET /api/usuarios/:id (Para cargar datos en el form de editar)
router.get('/:id', getUsuarioById);

// POST /api/usuarios (Crear)
router.post('/', createUsuario); 

// PUT /api/usuarios/:id (Actualizar)
router.put('/:id', updateUsuario);

// DELETE /api/usuarios/:id (Eliminar)
router.delete('/:id', deleteUsuario);

module.exports = router;