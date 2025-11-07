// middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Almacena los datos del usuario en req
    next(); // Pasa al siguiente middleware o controlador
  } catch (err) {
    res.status(403).json({ error: 'Token inválido o expirado.' });
  }
};

module.exports = verifyToken;