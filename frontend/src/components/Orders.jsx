// -----------------------------------------------------------------------------
// Archivo: Orders.jsx
// Descripción: Componente que muestra las órdenes abiertas del usuario.
// Permite gestionar y visualizar el estado de las operaciones en curso.
// -----------------------------------------------------------------------------

import { useEffect, useState, useContext } from "react";
import axios from "axios";

const API_URL = import.meta.env.BACKEND_API_URL || "http://localhost:5000/api";

import { AuthContext } from "../context/AuthContext";
import { usePortfolio } from "../context/PortfolioContext";

/**
 * Componente Orders
 * Muestra una tabla con las órdenes abiertas del usuario.
 * Permite cerrar órdenes abiertas mediante una acción en la tabla.
 * Utiliza el contexto de autenticación para obtener el usuario actual y consulta la API para obtener las órdenes abiertas.
 */
const Orders = ({ onOrderClosed }) => {
  // Obtiene el usuario autenticado del contexto
  const { user } = useContext(AuthContext);
  const { selectedPortfolioId, setAvailableBalance } = usePortfolio();
  // Estado para almacenar las órdenes abiertas
  const [orders, setOrders] = useState([]);

  /**
   * useEffect para cargar las órdenes abiertas del usuario al montar el componente o cambiar el usuario.
   * Llama a la API para obtener las órdenes abiertas y las almacena en el estado.
   */
  useEffect(() => {
    /**
     * fetchOrders
     * Función asíncrona que obtiene las órdenes abiertas del usuario desde la API.
     * - Si el usuario no está autenticado, no hace nada.
     * - Filtra las órdenes para mostrar solo las abiertas.
     * - Maneja errores de red o de la API.
     */
    const fetchOrders = async () => {
      if (!user?.id || !selectedPortfolioId) return;

      try {
        const response = await axios.get(
          `${API_URL}/orders/portfolio/${selectedPortfolioId}?estado=Abierta`
        );
        setOrders(response.data.filter((order) => order.estado === "Abierta"));
      } catch (error) {
        console.error("Error obteniendo órdenes:", error.message);
      }
    };

    fetchOrders();
  }, [user, selectedPortfolioId]);

  /**
   * handleCloseOrder
   * Cierra una orden abierta enviando una solicitud a la API.
   * @param {string} orderId - ID de la orden a cerrar
   * - Llama a la API para cerrar la orden.
   * - Si la operación es exitosa, elimina la orden del estado local.
   * - Muestra alertas en caso de éxito o error.
   */
  const handleCloseOrder = async (orderId) => {
    try {
      const response = await axios.post(`${API_URL}/orders/close`, {
        userId: user.id,
        orderId,
      });

      if (response.status === 200) {
        alert("Orden cerrada exitosamente.");
        setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
        if (typeof setAvailableBalance === 'function' && typeof response.data.updatedBalance === 'number') {
          setAvailableBalance(response.data.updatedBalance);
        }
        // Llama al callback de refresco si existe
        if (typeof onOrderClosed === 'function') {
          onOrderClosed();
        }
      }
    } catch (error) {
      console.error("Error cerrando la orden:", error.message);
      alert("Error al cerrar la orden.");
    }
  };

  // Renderiza la tabla de órdenes abiertas y permite cerrarlas
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
            <th className="py-2 px-4 border-b">Stop Loss</th>
            <th className="py-2 px-4 border-b">Take Profit</th>
            <th className="py-2 px-4 border-b">Fecha</th>
            <th className="py-2 px-4 border-b">Acciones</th>
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
              <td className="py-2 px-4 border-b">${order.stopLoss.toFixed(2)}</td>
              <td className="py-2 px-4 border-b">${order.takeProfit.toFixed(2)}</td>
              <td className="py-2 px-4 border-b">{new Date(order.fechaCreacion).toLocaleDateString()}</td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => handleCloseOrder(order._id)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Cerrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Orders;
