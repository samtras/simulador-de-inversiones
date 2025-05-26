const dotenv = require('dotenv');
// Cargar .env.test si estamos en entorno de test
if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: './backend/.env.test' });
} else {
  dotenv.config();
}

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./src/routes/authRoutes');
const marketDataRoutes = require('./src/routes/marketDataRoutes');
const userRoutes = require('./src/routes/userRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const portfolioRoutes = require('./src/routes/portfolioRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://simulador-frontend-4129b7cb9731.herokuapp.com',
    'https://www.plataforma-inversion-educativa.store'
  ],
  credentials: true
}));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/market-data', marketDataRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/portfolios', portfolioRoutes); // <-- esta línea es correcta

// Middleware 404 (debe ir al final, después de todas las rutas)
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Exporta solo la app para los tests
module.exports = app;


// Solo inicia el servidor si se ejecuta directamente
if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log('✅ Conectado a MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    });
  }).catch((err) => {
    console.error('❌ Error conectando a MongoDB:', err.message);
  });
}