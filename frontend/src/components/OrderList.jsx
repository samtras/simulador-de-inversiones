// -----------------------------------------------------------------------------
// Archivo: OrderList.jsx
// Descripción: Componente que lista las órdenes abiertas o cerradas del usuario.
// Permite visualizar detalles de cada operación y su estado actual.
// -----------------------------------------------------------------------------

import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, '');

/**
 * Componente OrderList
 * Lista todas las órdenes (abiertas y cerradas) de un usuario específico.
 * Permite visualizar detalles como tipo, cantidad, precios, estado y resultado de cada orden.
 * @param {string} userId - ID del usuario cuyas órdenes se van a mostrar
 */
const OrderList = ({ userId }) => {
  // Estado para almacenar las órdenes obtenidas de la API
  const [orders, setOrders] = useState([]);

  /**
   * useEffect para cargar las órdenes del usuario al montar el componente o cambiar el userId.
   * Llama a la API para obtener todas las órdenes del usuario y las almacena en el estado.
   */
  useEffect(() => {
    /**
     * fetchOrders
     * Función asíncrona que obtiene todas las órdenes del usuario desde la API.
     * - Maneja errores de red o de la API.
     */
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API_URL}/orders/${userId}`);
        setOrders(response.data);
      } catch (error) {
        console.error("Error obteniendo las órdenes:", error.message);
      }
    };

    fetchOrders();
  }, [userId]);

  // Renderiza la tabla de órdenes con sus detalles
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Órdenes</h2>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Activo</th>
            <th className="py-2 px-4 border-b">Tipo</th>
            <th className="py-2 px-4 border-b">Cantidad</th>
            <th className="py-2 px-4 border-b">Precio Entrada</th>
            <th className="py-2 px-4 border-b">Knockout</th>
            <th className="py-2 px-4 border-b">Stop Loss</th>
            <th className="py-2 px-4 border-b">Take Profit</th>
            <th className="py-2 px-4 border-b">Estado</th>
            <th className="py-2 px-4 border-b">Resultado</th>
            <th className="py-2 px-4 border-b">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td className="py-2 px-4 border-b">{order.symbol}</td>
              <td
                className={`py-2 px-4 border-b ${
                  order.tipoOperacion === "Compra" ? "text-green-500" : "text-red-500"
                }`}
              >
                {order.tipoOperacion}
              </td>
              <td className="py-2 px-4 border-b">{order.cantidad}</td>
              <td className="py-2 px-4 border-b">${order.precioEntrada.toFixed(2)}</td>
              <td className="py-2 px-4 border-b">${order.knockout.toFixed(2)}</td>
              <td className="py-2 px-4 border-b">${order.stopLoss.toFixed(2)}</td>
              <td className="py-2 px-4 border-b">${order.takeProfit.toFixed(2)}</td>
              <td className="py-2 px-4 border-b">{order.estado}</td>
              <td className="py-2 px-4 border-b">
                {order.resultado !== null ? `$${order.resultado.toFixed(2)}` : "N/A"}
              </td>
              <td className="py-2 px-4 border-b">
                {new Date(order.fechaCreacion).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderList;
