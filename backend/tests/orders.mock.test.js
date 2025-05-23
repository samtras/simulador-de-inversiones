// Test avanzado: Mock de base de datos para órdenes
// Simula respuestas exitosas y fallidas de la base de datos usando jest.mock

const request = require('supertest');
const app = require('../server');
const Order = require('../src/models/Order');

jest.mock('../src/models/Order'); // Mockea el modelo Order

const mongoose = require('mongoose');
const User = require('../src/models/User');

let userId = new mongoose.Types.ObjectId().toString();

beforeAll(async () => {
  // Si quieres usar un usuario real, puedes descomentar y adaptar:
  // await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  // await User.deleteMany({ email: 'usuario@ejemplo.com' });
  // const user = await User.create({ email: 'usuario@ejemplo.com', password: 'contraseña123', balance: 5000 });
  // userId = user._id.toString();
});

afterAll(async () => {
  // await User.deleteMany({ email: 'usuario@ejemplo.com' });
  // await mongoose.connection.close();
});

describe('POST /api/orders (mock DB)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería crear una orden correctamente (mock éxito)', async () => {
    // Simula que Order.create devuelve una orden creada
    Order.create.mockResolvedValue({
      _id: 'mockid',
      userId,
      symbol: 'AAPL',
      cantidad: 10,
      tipoOperacion: 'Compra',
      precioEntrada: 150
    });
    const res = await request(app)
      .post('/api/orders')
      .send({ userId, symbol: 'AAPL', quantity: 10, type: 'buy', price: 150, stopLoss: 140, takeProfit: 170 });
    expect(res.statusCode).toBe(201);
    expect(res.body.orden).toHaveProperty('symbol', 'AAPL');
  });

  it('debería responder con error si la base de datos falla', async () => {
    // Simula que Order.create lanza un error
    Order.create.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .post('/api/orders')
      .send({ userId, symbol: 'AAPL', quantity: 10, type: 'buy', price: 150 });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body).toHaveProperty('error');
  });
});

// ¿Qué hace este archivo?
// - Mockea el modelo Order para simular respuestas de la base de datos.
// - Permite probar el endpoint de órdenes sin depender de una base real.
// - Verifica el manejo de éxito y error en la creación de órdenes.
