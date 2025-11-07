// controllers/usuarios.controller.js
const pool = require('../config/database');
const bcrypt = require('bcrypt');

// GET /api/usuarios
const getAllUsuarios = async (req, res) => {
  try {
    // Excluimos el hash de la contraseña por seguridad
    const result = await pool.query('SELECT id, username, nombre_completo, permissions FROM usuarios ORDER BY username');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// GET /api/usuarios/:id
const getUsuarioById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, username, nombre_completo, permissions FROM usuarios WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// POST /api/usuarios
const createUsuario = async (req, res) => {
  const { username, password, nombre_completo, permissions } = req.body;

  if (!username || !password || !nombre_completo || !permissions) {
    return res.status(400).json({ error: 'Todos los campos son requeridos.' });
  }
  if (!process.env.PASSWORD_PEPPER) {
    return res.status(500).json({ error: 'El servidor no está configurado para autenticación.' });
  }

  try {
    const passwordWithPepper = password + process.env.PASSWORD_PEPPER;
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(passwordWithPepper, saltRounds);

    const result = await pool.query(
      `INSERT INTO usuarios (username, password_hash, nombre_completo, permissions) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, username, nombre_completo, permissions`,
      [username, password_hash, nombre_completo, permissions]
    );
    
    res.status(201).json(result.rows[0]);

  } catch (err) {
    if (err.code === '23505') { // unique_violation
      return res.status(409).json({ error: 'El nombre de usuario ya existe.' });
    }
    console.error(err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// PUT /api/usuarios/:id
const updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { username, nombre_completo, permissions, password } = req.body; // Password es opcional

  if (!username || !nombre_completo || !permissions) {
    return res.status(400).json({ error: 'Username, nombre y permisos son requeridos.' });
  }

  try {
    if (password && password.trim() !== '') {
      // Si se provee una nueva contraseña, la hasheamos
      const passwordWithPepper = password + process.env.PASSWORD_PEPPER;
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(passwordWithPepper, saltRounds);
      
      const result = await pool.query(
        `UPDATE usuarios SET 
           username = $1, 
           nombre_completo = $2, 
           permissions = $3, 
           password_hash = $4
         WHERE id = $5 RETURNING id, username, nombre_completo, permissions`,
        [username, nombre_completo, permissions, password_hash, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json(result.rows[0]);

    } else {
      // Si no se provee contraseña, solo actualizamos el resto
      const result = await pool.query(
        `UPDATE usuarios SET 
           username = $1, 
           nombre_completo = $2, 
           permissions = $3 
         WHERE id = $4 RETURNING id, username, nombre_completo, permissions`,
        [username, nombre_completo, permissions, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json(result.rows[0]);
    }
  } catch (err) {
     if (err.code === '23505') {
      return res.status(409).json({ error: 'El nombre de usuario ya existe.' });
    }
    console.error(err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// DELETE /api/usuarios/:id
const deleteUsuario = async (req, res) => {
  const { id } = req.params;
  
  // No permitir que el admin principal (ID 1) se borre
  if (parseInt(id, 10) === 1) {
    return res.status(403).json({ error: 'No se puede eliminar al administrador principal.' });
  }
  
  // No permitir que un usuario se borre a sí mismo
  if (parseInt(id, 10) === req.user.userId) {
     return res.status(403).json({ error: 'No te puedes eliminar a ti mismo.' });
  }

  try {
    const result = await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.sendStatus(204); // Sin contenido, éxito
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario
};