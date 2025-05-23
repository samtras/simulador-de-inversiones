// -----------------------------------------------------------------------------
// Archivo: orders.test.js
// Descripción: Pruebas automáticas para el endpoint de creación de órdenes.
// Se utiliza Jest como framework de testing y Supertest para simular peticiones HTTP.
// -----------------------------------------------------------------------------

const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../src/models/user');

let userId;
let portfolioId; // Nuevo

// Aumenta el timeout global a 30 segundos
jest.setTimeout(30000);

// Conexión a la base de datos y creación de usuario de prueba antes de todos los tests
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({ email: 'usuario@ejemplo.com' });
  const user = await User.create({ email: 'usuario@ejemplo.com', password: 'contraseña123', balance: 5000 });
  userId = user._id.toString();
  // Crear portafolio de prueba
  const Portfolio = require('../src/models/Portfolio');
  await Portfolio.deleteMany({ userId });
  const portfolio = await Portfolio.create({ userId, name: 'Test Portfolio', balance: 5000 });
  portfolioId = portfolio._id.toString();
});

// Limpieza de usuario de prueba y cierre de conexión a la base de datos después de todos los tests
afterAll(async () => {
  await User.deleteMany({ email: 'usuario@ejemplo.com' });
  await mongoose.connection.close();
});

// Test para el endpoint de creación de órdenes
// Utiliza Jest y Supertest para simular peticiones HTTP y verificar respuestas

describe('POST /api/orders', () => {
  // Test: Verifica que se puede crear una orden con datos válidos
  it('debería crear una orden y responder con la orden creada', async () => {
    const nuevaOrden = {
      userId,
      portfolioId, // <-- Añadir aquí
      symbol: 'AAPL',
      quantity: 10,
      type: 'buy',
      price: 150,
      stopLoss: 140,
      takeProfit: 170
    };
    const res = await request(app)
      .post('/api/orders')
      .send(nuevaOrden);
    expect(res.statusCode).toBe(201); // Espera un status 201 Created
    expect(res.body.orden).toHaveProperty('symbol', 'AAPL');
    expect(res.body.orden).toHaveProperty('cantidad', 10);
    // Agrega más validaciones según la respuesta esperada
  });

  // Test: Verifica que no se puede crear una orden con datos inválidos
  it('debería responder con error si los datos son inválidos', async () => {
    const ordenInvalida = {
      userId,
      portfolioId, // <-- Añadir aquí para que la validación sea solo por otros campos
      symbol: '', // símbolo vacío
      quantity: -5, // cantidad negativa
      type: 'buy',
      price: 0
    };
    const res = await request(app)
      .post('/api/orders')
      .send(ordenInvalida);
    expect(res.statusCode).toBeGreaterThanOrEqual(400); // Espera un error 4xx
    expect(res.body).toHaveProperty('error');
  });
});

// ¿Qué hace este archivo?
// - Simula peticiones POST al endpoint de órdenes.
// - Verifica que se pueden crear órdenes válidas y que las inválidas son rechazadas.
// - Sirve para asegurar la lógica de negocio y validaciones del endpoint de órdenes.
