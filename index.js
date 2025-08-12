// index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/database'); // <-- Importamos nuestra configuración de DB
const conceptosRoutes = require('./routes/conceptos.routes.js');
const listasRoutes = require('./routes/listas.routes.js');
const alumnosRoutes = require('./routes/alumnos.routes.js');
const cargosRoutes = require('./routes/cargos.routes.js');
const recibosRoutes = require('./routes/recibos.routes.js');
const reportesRoutes = require('./routes/reportes.routes.js');
const estadoCuentaRoutes = require('./routes/estadoCuenta.routes.js');
const ciclosRoutes = require('./routes/ciclos.routes.js');
const licenciaturasRoutes = require('./routes/licenciaturas.routes.js');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/alumnos', alumnosRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/ciclos-escolares', ciclosRoutes);
app.use('/api/licenciaturas', licenciaturasRoutes);

const PORT = process.env.PORT || 3000;

// Ruta de prueba del servidor
app.get('/', (req, res) => {
  res.send('¡El servidor del control escolar está funcionando! 🚀');
});

// --- NUEVA RUTA PARA PROBAR LA CONEXIÓN A LA DB ---
app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()'); // Pide la hora actual a la DB
    res.json({
      message: 'Conexión a la base de datos exitosa',
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error al conectar con la base de datos:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
// --- FIN DE LA NUEVA RUTA ---



// Para obtener los cargos de un alumno específico la ruta será: /api/alumnos/1/cargos
app.use('/api/alumnos/:alumnoId/cargos', cargosRoutes);
app.use('/api/conceptos', conceptosRoutes);
app.use('/api/listas-precios', listasRoutes);
app.use('/api/recibos', recibosRoutes);
alumnosRoutes.use('/:alumnoId/estado-de-cuenta', estadoCuentaRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});