// -----------------------------------------------------------------------------
// Archivo: marketData.test.js
// Descripción: Pruebas automáticas para el endpoint de datos de mercado.
// Se utiliza Jest como framework de testing y Supertest para simular peticiones HTTP.
// -----------------------------------------------------------------------------

const request = require('supertest');
const app = require('../server'); // Exporta tu app de Express en server.js

/**
 * Test: GET /api/market-data
 * Objetivo: Verificar que el endpoint responde correctamente y devuelve un array de datos.
 */
describe('GET /api/market-data', () => {
  // Test: Verifica que el endpoint responde con datos de mercado
  it('debería responder con un array de datos de mercado', async () => {
    const res = await request(app).get('/api/market-data');
    expect(res.statusCode).toBe(200); // Espera un status 200 OK
    expect(Array.isArray(res.body)).toBe(true); // La respuesta debe ser un array
    // Puedes agregar más validaciones según la estructura esperada de los datos
  });

  // Puedes agregar aquí tests adicionales para casos de error usando mocks
});

// ¿Qué hace este archivo?
/**
 * - Simula peticiones GET al endpoint de datos de mercado.
 * - Verifica que la respuesta sea un array (lista) de datos.
 * - Sirve para asegurar que el endpoint de mercado funciona y responde correctamente.
 */
