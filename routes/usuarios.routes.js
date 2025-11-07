// routes/usuarios.routes.js
const { Router } = require('express');
const checkPermission = require('../middleware/checkPermission'); // <-- **IMPORTAR**
const {
  getAllUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  getUsuarioById
} = require('../controllers/usuarios.controller.js');

const router = Router();

// GET /api/usuarios (Protegido por 'config_ver_usuarios' en index.js)
router.get('/', getAllUsuarios);

// GET /api/usuarios/:id (Para cargar datos en el form de editar)
// Solo quien puede editar puede cargar los datos de un usuario
router.get('/:id', checkPermission('usuarios_editar'), getUsuarioById);

// POST /api/usuarios (Crear)
router.post('/', checkPermission('usuarios_crear'), createUsuario); // <-- **PROTEGIDO**

// PUT /api/usuarios/:id (Actualizar)
router.put('/:id', checkPermission('usuarios_editar'), updateUsuario); // <-- **PROTEGIDO**

// DELETE /api/usuarios/:id (Eliminar)
router.delete('/:id', checkPermission('usuarios_eliminar'), deleteUsuario); // <-- **PROTEGIDO**

module.exports = router;