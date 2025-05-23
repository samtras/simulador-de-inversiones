// -----------------------------------------------------------------------------
// Archivo: authController.js
// Descripción: Controlador de autenticación de usuarios. Gestiona el registro y
// login, validando credenciales y generando tokens JWT. Incluye lógica para el
// hash de contraseñas y manejo de errores comunes en autenticación.
// -----------------------------------------------------------------------------

const User = require('../models/user');
const Portfolio = require('../models/Portfolio');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Controlador de autenticación de usuarios
 * Gestiona el registro y login, validando credenciales y generando tokens JWT.
 * Incluye lógica para el hash de contraseñas y manejo de errores comunes en autenticación.
 */

/**
 * register
 * Registra un nuevo usuario en la base de datos.
 * - Verifica si el correo ya está registrado.
 * - Si no existe, crea un nuevo usuario con el correo, contraseña (hasheada) y rol.
 * - Devuelve un mensaje de éxito o error.
 * @param {Request} req - Objeto de solicitud HTTP (debe contener email, password y opcionalmente role)
 * @param {Response} res - Objeto de respuesta HTTP
 */
exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (await User.findOne({ email })) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const newUser = new User({ email, password, role: role || 'user' });
    await newUser.save();

    // Crear portafolio por defecto
    await Portfolio.create({
      userId: newUser._id,
      name: "portafolio 1",
      fondoDisponible: 3000,
      balance: 3000
    });

    res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor', details: error.message });
  }
};

/**
 * login
 * Autentica a un usuario existente.
 * - Busca el usuario por correo.
 * - Compara la contraseña ingresada con la almacenada (hasheada).
 * - Si es válida, genera y devuelve un token JWT y los datos básicos del usuario.
 * - Si no, devuelve un mensaje de error.
 * @param {Request} req - Objeto de solicitud HTTP (debe contener email y password)
 * @param {Response} res - Objeto de respuesta HTTP
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor', details: error.message });
  }
};

/*
Explicación del controlador de autenticación:
- register: Verifica si el usuario existe, encripta la contraseña y lo guarda en la base de datos.
- login: Compara la contraseña ingresada con la almacenada y genera un token JWT.
*/