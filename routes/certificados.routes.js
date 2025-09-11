// routes/certificados.routes.js
const { Router } = require('express');
const multer = require('multer');
const { generarPdfDesdeXml } = require('../controllers/certificados.controller.js');

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Esta ruta recibirá un solo archivo XML con el nombre 'xmlFile'
router.post('/generar-pdf', upload.single('xmlFile'), generarPdfDesdeXml);

module.exports = router;