// -----------------------------------------------------------------------------
// Archivo: userRoutes.js
// Descripción: Rutas de la API para la gestión de usuarios. Permite consultar y
// actualizar el balance virtual de un usuario. Incluye validaciones y manejo de
// errores para operaciones sobre usuarios.
// -----------------------------------------------------------------------------

const express = require('express');
const User = require('../models/user');

const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    // Ya no devolvemos el balance del usuario
    res.json({ id: user._id, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor', details: error.message });
  }
});

module.exports = router;