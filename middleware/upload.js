// /middleware/upload.js
const multer = require('multer');
const path = require('path');

// Configurar almacenamiento para los archivos subidos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Especifica el directorio donde se guardarán los archivos temporalmente
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Genera un nombre de archivo único
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Filtro para aceptar solo archivos CSV y JSON
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || file.mimetype === 'application/json') {
    cb(null, true);
  } else {
    cb(new Error('Formato de archivo no soportado. Sube solo CSV o JSON.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 } // Límite de 5MB por archivo
});

module.exports = upload;