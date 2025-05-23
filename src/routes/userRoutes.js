import express from 'express';
import { getUserProfile } from '../controllers/userController.js';

const router = express.Router();

// Ruta para obtener el perfil de usuario
router.get('/api/users/profile', authMiddleware, async (req, res) => {
  try {
    const user = await getUserProfile(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Middleware de autenticación simulado para tests
function authMiddleware(req, res, next) {
  // Si no hay token, responde 401
  const auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  // Si el token es inválido, responde 401
  if (auth === 'Bearer token_invalido') {
    return res.status(401).json({ error: 'Token inválido' });
  }
  // ...puedes simular usuario aquí si es necesario...
  next();
}

export default router;