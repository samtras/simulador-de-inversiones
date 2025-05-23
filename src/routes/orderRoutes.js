import express from 'express';
import Order from '../models/Order.js';

const router = express.Router();

router.post('/api/orders', async (req, res) => {
  // Permitir ambos formatos de campos
  const userId = req.body.userId;
  const symbol = req.body.symbol;
  const tipoOperacion = req.body.tipoOperacion || req.body.type;
  const cantidad = req.body.cantidad || req.body.quantity;
  const precioEntrada = req.body.precioEntrada || req.body.price;

  // Validar que todos los campos obligatorios estén presentes
  if (!userId || !symbol || !tipoOperacion || !cantidad || !precioEntrada) {
    console.error("Solicitud inválida. Datos recibidos:", req.body);
    return res.status(400).json({ error: 'Todos los campos obligatorios deben estar presentes.' });
  }

  try {
    // Crear una nueva orden
    const nuevaOrden = new Order({
      userId,
      symbol,
      tipoOperacion,
      cantidad,
      precioEntrada
    });

    // Guardar la orden en la base de datos
    await nuevaOrden.save();

    return res.status(201).json(nuevaOrden);
  } catch (error) {
    console.error("Error al crear la orden:", error);
    return res.status(500).json({ error: 'Error interno del servidor.' });




export default router;});  }  }
});

export default router;