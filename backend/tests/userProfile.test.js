// Test para el endpoint de usuarios (ejemplo: obtener perfil de usuario)
// Utiliza Jest y Supertest para simular peticiones HTTP y verificar respuestas

const request = require('supertest');
const app = require('../server');

describe('GET /api/users/profile', () => {
  // Test: Verifica que se puede obtener el perfil de usuario autenticado
  it('debería responder con los datos del usuario autenticado', async () => {
    // Necesitas un token válido para este test si el endpoint está protegido
    // const token = 'aquí_va_un_token_válido';
    const res = await request(app)
      .get('/api/users/profile')
      // .set('Authorization', `Bearer ${token}`) // Descomenta si es necesario
    expect(res.statusCode).toBe(200); // Espera un status 200 OK
    expect(res.body).toHaveProperty('email'); // La respuesta debe incluir el email del usuario
    // Agrega más validaciones según la estructura del usuario
  });

  // Test: Verifica que sin autenticación responde con error
  it('debería responder con error si no hay autenticación', async () => {
    const res = await request(app)
      .get('/api/users/profile');
    expect(res.statusCode).toBeGreaterThanOrEqual(401); // Espera un error 401 Unauthorized o similar
    expect(res.body).toHaveProperty('error');
  });
});

// ¿Qué hace este archivo?
// - Simula peticiones GET al endpoint de perfil de usuario.
// - Verifica que solo usuarios autenticados pueden acceder a su perfil.
// - Sirve para asegurar la seguridad y correcta respuesta del endpoint de usuario.
