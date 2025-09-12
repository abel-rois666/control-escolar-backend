// routes/xmlGenerator.routes.js
const { Router } = require('express');
const multer = require('multer');
const { generarXmlDesdeExcel } = require('../controllers/xmlGenerator.controller.js');

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/generar-xml-desde-excel', upload.single('excelFile'), generarXmlDesdeExcel);

module.exports = router;