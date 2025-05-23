// -----------------------------------------------------------------------------
// Archivo: authRoutes.js
// Descripción: Rutas de la API para autenticación de usuarios. Permite el
// registro y login, delegando la lógica en el controlador de autenticación.
// -----------------------------------------------------------------------------

const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

module.exports = router;