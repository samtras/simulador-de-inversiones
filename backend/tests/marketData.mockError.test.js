// Test avanzado: Mock de error en el servicio de datos de mercado
// Simula que el servicio falla y verifica el manejo de errores

const request = require('supertest');
const app = require('../server');

// Si tienes un servicio separado para obtener datos de mercado, puedes mockearlo
jest.mock('../src/services/marketDataService', () => ({
  getMarketData: jest.fn(() => { throw new Error('Service error'); })
}));

describe('GET /api/market-data (mock error)', () => {
  it('debería responder con error si el servicio de datos de mercado falla', async () => {
    const res = await request(app).get('/api/market-data');
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body).toHaveProperty('error');
  });
});

// ¿Qué hace este archivo?
// - Mockea el servicio de datos de mercado para simular un fallo.
// - Permite probar que el endpoint responde correctamente ante errores internos.
// - Útil para asegurar la robustez del backend ante fallos de servicios externos.
