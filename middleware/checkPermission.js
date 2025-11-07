// middleware/checkPermission.js

// Esta es una "función de fábrica": crea un middleware
// específico para el permiso que le pidas.
const checkPermission = (permission) => {
  return (req, res, next) => {
    
    // req.user fue establecido por el middleware anterior (verifyToken)
    if (!req.user || !req.user.permissions) {
      return res.status(403).json({ error: 'Acceso denegado. Permisos no encontrados.' });
    }

    // Comprueba si el objeto de permisos del usuario tiene la clave que se requiere
    if (req.user.permissions[permission]) {
      next(); // El usuario tiene el permiso, puede continuar
    } else {
      // El usuario no tiene este permiso específico
      return res.status(403).json({ error: 'Acceso denegado. No tienes permiso para esta acción.' });
    }
  };
};

module.exports = checkPermission;