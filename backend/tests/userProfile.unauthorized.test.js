// Test avanzado: Acceso no autorizado a endpoint protegido
// Intenta acceder sin token o con token inválido y verifica la respuesta

const request = require('supertest');
const app = require('../server');

describe('GET /api/users/profile (no auth)', () => {
  it('debería responder con 401 si no se envía token', async () => {
    const res = await request(app).get('/api/users/profile');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('debería responder con 401 si el token es inválido', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', 'Bearer token_invalido');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});

// ¿Qué hace este archivo?
// - Prueba el acceso a un endpoint protegido sin autenticación o con token inválido.
// - Verifica que el backend responde correctamente con error 401.
// - Asegura la seguridad de los endpoints protegidos.
