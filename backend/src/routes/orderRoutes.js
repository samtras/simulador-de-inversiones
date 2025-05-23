// -----------------------------------------------------------------------------
// Archivo: orderRoutes.js
// Descripción: Rutas de la API para la gestión de órdenes de trading. Permite
// crear, listar, cerrar y automatizar el cierre de operaciones. Incluye lógica
// para validar saldos, actualizar balances y proteger rutas según usuario.
// -----------------------------------------------------------------------------

const express = require('express');
const Order = require('../models/Order');
const User = require('../models/user');
const Portfolio = require('../models/Portfolio');
const axios = require('axios');
const { getCache, setCache } = require('../utils/cache');

const router = express.Router();

/**
 * Rutas de la API para la gestión de órdenes de trading.
 * Permite crear, listar, cerrar y automatizar el cierre de operaciones.
 * Incluye lógica para validar saldos, actualizar balances y proteger rutas según usuario.
 */

// Crear una nueva operación
router.post('/', async (req, res) => {
  // Permitir ambos formatos de campos
  const userId = req.body.userId;
  const symbol = req.body.symbol;
  const portfolioId = req.body.portfolioId;
  // Compatibilidad: aceptar 'type'/'tipoOperacion', 'quantity'/'cantidad', 'price'/'precioEntrada'
  const tipoOperacion = req.body.tipoOperacion || (req.body.type === 'buy' ? 'Compra' : req.body.type === 'sell' ? 'Venta' : undefined);
  const cantidad = req.body.cantidad || req.body.quantity;
  const precioEntrada = req.body.precioEntrada || req.body.price;
  const stopLoss = req.body.stopLoss;
  const takeProfit = req.body.takeProfit;

  // Validar que todos los campos obligatorios estén presentes
  if (!userId || !portfolioId || !symbol || !tipoOperacion || !cantidad || !precioEntrada || stopLoss === undefined || takeProfit === undefined) {
    return res.status(400).json({ error: 'Todos los campos obligatorios deben estar presentes: userId, portfolioId, symbol, tipoOperacion, cantidad, precioEntrada, stopLoss, takeProfit.' });
  }

  try {
    // Buscar el portafolio
    const portfolio = await Portfolio.findById(portfolioId);
    if (!portfolio) return res.status(404).json({ error: 'Portafolio no encontrado.' });

    const costoOperacion = precioEntrada * cantidad;
    // Lógica de balance para compra o venta (short)
    // Usar fondoDisponible para validar y actualizar saldo líquido
    if (tipoOperacion === 'Compra' && portfolio.fondoDisponible < costoOperacion) {
      return res.status(400).json({ error: 'Fondo disponible insuficiente en el portafolio.' });
    }
    if (tipoOperacion === 'Compra') {
      portfolio.fondoDisponible -= costoOperacion;
    } else {
      // Para shorts, podrías bloquear un margen, pero aquí solo sumamos el efectivo recibido
      portfolio.fondoDisponible += costoOperacion;
    }
    // El balance total se recalcula después de cada operación (fondoDisponible + valor de activos)
    // Aquí solo actualizamos fondoDisponible, el balance se debe recalcular en otro proceso o endpoint
    await portfolio.save();

    // Crear la nueva orden
    const nuevaOrden = new Order({
      userId,
      portfolioId,
      symbol,
      tipoOperacion,
      cantidad,
      precioEntrada,
      stopLoss,
      takeProfit,
      estado: 'Abierta',
    });

    await nuevaOrden.save();
    res.status(201).json({ message: 'Operación creada exitosamente', orden: nuevaOrden, updatedBalance: portfolio.balance });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor', details: error.message });
  }
});

/**
 * Obtener todas las operaciones de un portafolio
 * Devuelve todas las órdenes asociadas a un portafolio ordenadas por fecha de creación descendente.
 */
router.get('/portfolio/:portfolioId', async (req, res) => {
  try {
    const ordenes = await Order.find({ portfolioId: req.params.portfolioId }).sort({ fechaCreacion: -1 });
    res.json(ordenes);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor', details: error.message });
  }
});

/**
 * Automatización de cierre basado en stopLoss y takeProfit
 * Cierra automáticamente las órdenes abiertas si el precio actual alcanza los niveles definidos.
 * - Para compras: cierra si el precio >= takeProfit o <= stopLoss
 * - Para ventas: cierra si el precio <= takeProfit o >= stopLoss
 * Actualiza el balance del usuario y marca la orden como cerrada con la razón correspondiente.
 */
router.post('/auto-close', async (req, res) => {
  const { symbol, currentPrice } = req.body;

  if (!symbol || !currentPrice) {
    return res.status(400).json({ error: 'El símbolo y el precio actual son obligatorios.' });
  }

  try {
    const orders = await Order.find({ symbol, estado: 'Abierta' });

    for (const order of orders) {
      let razonCierre = null;

      if (order.tipoOperacion === 'Compra') {
        if (currentPrice >= order.takeProfit) razonCierre = 'takeProfit';
        if (currentPrice <= order.stopLoss) razonCierre = 'stopLoss';
      } else if (order.tipoOperacion === 'Venta') {
        if (currentPrice <= order.takeProfit) razonCierre = 'takeProfit';
        if (currentPrice >= order.stopLoss) razonCierre = 'stopLoss';
      }

      if (razonCierre) {
        const resultado =
          (order.tipoOperacion === 'Compra'
            ? currentPrice - order.precioEntrada
            : order.precioEntrada - currentPrice) * order.cantidad;

        const portfolio = await Portfolio.findById(order.portfolioId);
        portfolio.balance += currentPrice * order.cantidad + resultado;
        await portfolio.save();

        order.estado = 'Cerrada';
        order.precioSalida = currentPrice;
        order.resultado = resultado;
        order.fechaCierre = new Date();
        order.razonCierre = razonCierre;
        await order.save();
      }
    }

    res.status(200).json({ message: 'Órdenes cerradas automáticamente según stopLoss/takeProfit.' });
  } catch (error) {
    console.error('Error en auto-cierre:', error.message);
    res.status(500).json({ error: 'Error en el servidor', details: error.message });
  }
});

/**
 * Ruta para cerrar una orden manualmente
 * Permite al usuario cerrar una orden abierta de forma manual.
 * - Obtiene el precio actual del activo (usando caché o API externa)
 * - Calcula el resultado de la operación
 * - Ajusta el balance del usuario según el tipo de operación
 * - Marca la orden como cerrada y almacena los datos de cierre
 */
router.post('/close', async (req, res) => {
  const { userId, orderId } = req.body;

  if (!userId || !orderId) {
    return res.status(400).json({ error: 'El userId y orderId son obligatorios.' });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order || order.userId.toString() !== userId) {
      return res.status(404).json({ error: 'Orden no encontrada o acceso denegado.' });
    }

    const portfolio = await Portfolio.findById(order.portfolioId);
    if (!portfolio) return res.status(404).json({ error: 'Portafolio no encontrado.' });

    const cacheKey = `price_${order.symbol}`;
    let currentPrice = getCache(cacheKey);
    if (!currentPrice) {
      const response = await axios.get(
        `https://financialmodelingprep.com/api/v3/quote/${order.symbol}?apikey=${process.env.FMP_API_KEY}`
      );
      currentPrice = response.data[0]?.price;
      if (!currentPrice) return res.status(500).json({ error: 'No se pudo obtener el precio actual.' });
      setCache(cacheKey, currentPrice, 10 * 60 * 1000);
    }

    // Cálculo de resultado para compra o venta (short)
    const resultado =
      (order.tipoOperacion === 'Compra'
        ? currentPrice - order.precioEntrada
        : order.precioEntrada - currentPrice) * order.cantidad;

    // Ajuste de balance y fondoDisponible en el portafolio:
    if (order.tipoOperacion === 'Compra') {
      // Al cerrar una compra, se vende el activo y se recupera el efectivo
      portfolio.fondoDisponible += currentPrice * order.cantidad;
      portfolio.balance += currentPrice * order.cantidad + resultado;
    } else {
      // Al cerrar un short, se paga el precio actual para recomprar
      portfolio.fondoDisponible -= currentPrice * order.cantidad;
      portfolio.balance -= currentPrice * order.cantidad - resultado;
    }
    await portfolio.save();

    order.estado = 'Cerrada';
    order.precioSalida = currentPrice;
    order.resultado = resultado;
    order.fechaCierre = new Date();
    order.razonCierre = 'manual';
    await order.save();

    res.status(200).json({ message: 'Orden cerrada exitosamente.', order, updatedBalance: portfolio.fondoDisponible });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor', details: error.message });
  }
});

module.exports = router;
