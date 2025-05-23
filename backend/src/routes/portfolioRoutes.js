console.log('*** portfolioRoutes.js CARGADO ***');

const express = require('express');
const Portfolio = require('../models/Portfolio');
const router = express.Router();

// Listar portafolios de un usuario
router.get('/user/:userId', async (req, res) => {
  console.log('*** GET /api/portfolios/user/:userId ***', req.params.userId); // <-- LOG DE PETICIÓN
  try {
    const portfolios = await Portfolio.find({ userId: req.params.userId });
    res.status(200).json(portfolios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener portafolios', details: error.message });
  }
});

// Crear un nuevo portafolio
router.post('/', async (req, res) => {
  try {
    const { userId, name, balance } = req.body;
    if (!userId || !name) {
      return res.status(400).json({ error: 'userId y name son obligatorios' });
    }
    const nuevoPortafolio = new Portfolio({
      userId,
      name,
      fondoDisponible: balance ?? 10000, // El saldo inicial es fondoDisponible
      balance: balance ?? 10000 // Inicialmente igual
    });
    await nuevoPortafolio.save();
    res.status(201).json(nuevoPortafolio);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear portafolio', details: error.message });
  }
});

// Obtener fondoDisponible y balance de un portafolio por ID
router.get('/:id', async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) return res.status(404).json({ error: 'Portafolio no encontrado' });
    // Devuelve fondoDisponible y balance
    res.json({
      fondoDisponible: portfolio.fondoDisponible,
      balance: portfolio.balance,
      ...portfolio.toObject()
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener portafolio', details: error.message });
  }
});

module.exports = router;
