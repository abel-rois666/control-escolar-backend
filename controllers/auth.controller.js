// controllers/auth.controller.js
const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
  }
  if (!process.env.PASSWORD_PEPPER || !process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'El servidor no está configurado para autenticación.' });
  }

  try {
    // 1. Buscar al usuario EN LA TABLA NUEVA 'usuarios'
    const result = await pool.query('SELECT * FROM usuarios WHERE username = $1', [username]); // <-- CAMBIO AQUÍ
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    // 2. Aplicar "Pimienta" y comparar
    const passwordWithPepper = password + process.env.PASSWORD_PEPPER;
    const match = await bcrypt.compare(passwordWithPepper, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    // 3. Crear y firmar el Token (JWT)
    //    ¡AÑADIMOS LOS PERMISOS AL PAYLOAD!
    const payload = {
      userId: user.id,
      username: user.username,
      permissions: user.permissions // <-- AÑADIDO
    };
    
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Devolvemos el token Y los permisos para el frontend
    res.json({ 
      message: 'Login exitoso', 
      token,
      user: {
        username: user.username,
        nombre_completo: user.nombre_completo,
        permissions: user.permissions
      }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { login };