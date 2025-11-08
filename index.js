// index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/database');
const verifyToken = require('./middleware/auth.middleware.js');
const checkPermission = require('./middleware/checkPermission.js');
const authRoutes = require('./routes/auth.routes.js');
const conceptosRoutes = require('./routes/conceptos.routes.js');
const listasRoutes = require('./routes/listas.routes.js');
const alumnosRoutes = require('./routes/alumnos.routes.js');
const cargosRoutes = require('./routes/cargos.routes.js');
const recibosRoutes = require('./routes/recibos.routes.js');
const reportesRoutes = require('./routes/reportes.routes.js');
const estadoCuentaRoutes = require('./routes/estadoCuenta.routes.js');
const ciclosRoutes = require('./routes/ciclos.routes.js');
const licenciaturasRoutes = require('./routes/licenciaturas.routes.js');
const consultasRoutes = require('./routes/consultas.routes.js');
const certificadosRoutes = require('./routes/certificados.routes.js');
const xmlGeneratorRoutes = require('./routes/xmlGenerator.routes.js');

// --- AÑADIDO: Importación para las nuevas rutas de usuarios ---
const usuariosRoutes = require('./routes/usuarios.routes.js');

const app = express();
app.use(cors());
app.use(express.json());

// --- RUTA PÚBLICA ---
// La ruta de Login no lleva 'verifyToken'
app.use('/api/auth', authRoutes);


// --- RUTAS PROTEGIDAS ---
// A partir de aquí, todas las rutas requieren un token válido Y un permiso

// Alumnos
app.use('/api/alumnos', verifyToken, checkPermission('alumnos_ver'), alumnosRoutes);

// Reportes y Certificados
// ***** ESTE ES EL CAMBIO CLAVE *****
// Se quitó checkPermission('reportes_ver_adeudos') de esta línea.
app.use('/api/reportes', verifyToken, reportesRoutes); 
app.use('/api/certificados', verifyToken, checkPermission('reportes_generar_certificados'), certificadosRoutes);

// Herramientas
app.use('/api/herramientas', verifyToken, checkPermission('herramientas_generar_xml'), xmlGeneratorRoutes); 

// Configuración
app.use('/api/ciclos-escolares', verifyToken, checkPermission('config_ver_ciclos'), ciclosRoutes);
app.use('/api/licenciaturas', verifyToken, checkPermission('config_ver_licenciaturas'), licenciaturasRoutes);
app.use('/api/conceptos', verifyToken, checkPermission('config_ver_conceptos'), conceptosRoutes);
app.use('/api/listas-precios', verifyToken, checkPermission('config_ver_planes'), listasRoutes);
app.use('/api/usuarios', verifyToken, checkPermission('config_ver_usuarios'), usuariosRoutes);

// Pagos y Recibos
app.use('/api/consultas/recibos', verifyToken, checkPermission('pagos_ver_recibos'), consultasRoutes);
app.use('/api/recibos', verifyToken, checkPermission('pagos_recibir'), recibosRoutes);

// Rutas Anidadas
// Estas rutas necesitan su propia protección explícita
app.use('/api/alumnos/:alumnoId/cargos', verifyToken, checkPermission('pagos_recibir'), cargosRoutes);

// Corregimos la ruta de estado de cuenta para que esté protegida
alumnosRoutes.use(
  '/:alumnoId/estado-de-cuenta', 
  verifyToken, 
  checkPermission('pagos_ver_estado_cuenta'), 
  estadoCuentaRoutes
);


const PORT = process.env.PORT || 3000;

// Ruta de prueba del servidor
app.get('/', (req, res) => {
  res.send('¡El servidor del control escolar está funcionando! 🚀');
});

// --- RUTA PARA PROBAR LA CONEXIÓN A LA DB ---
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
// --- FIN DE LA RUTA ---

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});