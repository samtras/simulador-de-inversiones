const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  fondoDisponible: { type: Number, default: 10000 }, // Saldo líquido para operar
  balance: { type: Number, default: 10000 }, // Suma de fondoDisponible + valor de activos
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Portfolio', PortfolioSchema);
