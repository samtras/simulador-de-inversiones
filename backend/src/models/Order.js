const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  portfolioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio', required: true },
  symbol: { type: String, required: true },
  tipoOperacion: { type: String, enum: ['Compra', 'Venta'], required: true },
  cantidad: { type: Number, required: true },
  precioEntrada: { type: Number, required: true },
  stopLoss: { type: Number, required: true },
  takeProfit: { type: Number, required: true },
  ordenLimitada: { type: Boolean, default: false },
  estado: { type: String, enum: ['Abierta', 'Cerrada'], default: 'Abierta' },
  resultado: { type: Number, default: null },
  fechaCreacion: { type: Date, default: Date.now },
  precioSalida: { type: Number, default: null },
  fechaCierre: { type: Date, default: null },
  razonCierre: { type: String, enum: ['stopLoss', 'takeProfit', 'manual'], default: null }, // Nuevo campo
});

module.exports = mongoose.model('Order', OrderSchema);
