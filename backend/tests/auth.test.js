// -----------------------------------------------------------------------------
// Archivo: auth.test.js
// Descripción: Pruebas automáticas para el endpoint de autenticación (login).
// Se utiliza Jest como framework de testing y Supertest para simular peticiones HTTP.
// -----------------------------------------------------------------------------

const request = require('supertest'); // Supertest permite hacer peticiones HTTP a la app de Express
const app = require('../server'); // Importamos la app de Express (debe exportarse en server.js)
const mongoose = require('mongoose');
const User = require('../src/models/user');

jest.setTimeout(30000); // Aumenta el timeout global a 30 segundos

// Crea un usuario de prueba antes de todos los tests
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({ email: 'usuario@ejemplo.com' });
  await User.create({ email: 'usuario@ejemplo.com', password: 'contraseña123', balance: 5000 });
});

// Limpia la base de datos después de todos los tests
afterAll(async () => {
  await User.deleteMany({ email: 'usuario@ejemplo.com' });
  await mongoose.connection.close();
});

describe('POST /api/auth/login', () => {
  // Test: Verifica que el login con credenciales válidas responde con un token
  it('debería responder con un token si las credenciales son correctas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'usuario@ejemplo.com', // Usa un usuario de prueba existente en tu base de datos o mock
        password: 'contraseña123'
      });
    expect(res.statusCode).toBe(200); // Espera un status 200 OK
    expect(res.body).toHaveProperty('token'); // La respuesta debe incluir un token
  });

  // Test: Verifica que el login con credenciales incorrectas responde con error
  it('debería responder con error si las credenciales son incorrectas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'usuario@ejemplo.com',
        password: 'contraseña_incorrecta'
      });
    expect(res.statusCode).toBe(401); // Espera un status 401 Unauthorized
    expect(res.body).toHaveProperty('error'); // La respuesta debe incluir un mensaje de error
  });
});

// ¿Qué hace este archivo?
/*
- Simula peticiones POST al endpoint de login.
- Verifica que el login exitoso devuelve un token.
- Verifica que el login fallido devuelve un error.
- Sirve para asegurar que la autenticación funciona correctamente y que los cambios futuros no la rompen.
*/
