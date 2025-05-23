// -----------------------------------------------------------------------------
// Archivo: authMiddleware.js
// Descripción: Middleware para la autenticación y autorización basada en JWT.
// Valida el token enviado en la cabecera Authorization y protege rutas privadas.
// Permite restringir acceso por roles. Devuelve errores claros en caso de token
// inválido o permisos insuficientes.
// -----------------------------------------------------------------------------

const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticación JWT
 * Valida el token enviado en la cabecera Authorization y protege rutas privadas.
 * Si el token es válido, adjunta el usuario decodificado a req.user y permite el acceso.
 * Si es inválido o no existe, responde con error 401.
 * @param {Request} req - Objeto de solicitud HTTP
 * @param {Response} res - Objeto de respuesta HTTP
 * @param {Function} next - Función para pasar al siguiente middleware
 */
module.exports = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Acceso denegado, token no proporcionado' });

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};

/**
 * Middleware para restricción de acceso por rol
 * Permite restringir rutas a usuarios con un rol específico.
 * @param {string} role - Rol requerido para acceder a la ruta
 * @returns {Function} Middleware de autorización por rol
 */
module.exports.checkRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ error: 'Acceso denegado, permisos insuficientes' });
  }
  next();
};

/*
Explicación del middleware de autenticación:
- Extrae el token de la cabecera 'Authorization'.
- Verifica que el token sea válido usando JWT y la clave secreta.
- Si es válido, adjunta el usuario decodificado a `req.user` y permite el acceso.
- Si es inválido, responde con un error 401 (Acceso no autorizado).
*/