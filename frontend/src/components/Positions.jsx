// -----------------------------------------------------------------------------
// Archivo: Positions.jsx
// Descripción: Componente que muestra las posiciones abiertas del usuario en el mercado.
// Presenta información relevante para el seguimiento de inversiones activas.
// ----------------------------------------------------------------------------

import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { usePortfolio } from "../context/PortfolioContext";

/**
 * Componente Positions
 * Muestra una tabla con las posiciones abiertas del usuario.
 * Utiliza el contexto de autenticación para obtener el usuario actual y consulta la API para obtener las órdenes abiertas.
 * Agrupa las órdenes por símbolo y calcula cantidades y valores totales.
 */
const Positions = ({ refresh }) => {
  // Obtiene el usuario autenticado del contexto
  const { user } = useContext(AuthContext);
  const { selectedPortfolioId } = usePortfolio();
  // Estado para almacenar las posiciones agrupadas
  const [positions, setPositions] = useState([]);

  /**
   * useEffect para cargar las posiciones abiertas del usuario al montar el componente o cambiar el usuario.
   * Llama a la API para obtener las órdenes abiertas y las agrupa por símbolo.
   */
  useEffect(() => {
    /**
     * fetchPositions
     * Función asíncrona que obtiene las órdenes abiertas del usuario desde la API y las agrupa por símbolo.
     * - Si el usuario no está autenticado, no hace nada.
     * - Agrupa las órdenes sumando cantidades y valores totales por símbolo.
     * - Maneja errores de red o de la API.
     */
    const fetchPositions = async () => {
      if (!user?.id || !selectedPortfolioId) return;

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/orders/portfolio/${selectedPortfolioId}?estado=Abierta`
        );
        // Agrupa las órdenes abiertas por símbolo, sumando cantidades y valores totales
        const groupedPositions = response.data.reduce((acc, order) => {
          const existing = acc.find((pos) => pos.symbol === order.symbol);
          if (existing) {
            existing.cantidad += order.cantidad;
            existing.valorTotal += order.cantidad * order.precioEntrada;
          } else {
            acc.push({
              symbol: order.symbol,
              cantidad: order.cantidad,
              valorTotal: order.cantidad * order.precioEntrada,
              precioActual: order.precioEntrada, // Inicialmente igual al precio de entrada
              // Se puede agregar más información si la API la provee
            });
          }
          return acc;
        }, []);
        setPositions(groupedPositions);
      } catch (error) {
        console.error("Error obteniendo posiciones:", error.message);
      }
    };

    fetchPositions();
  }, [user, selectedPortfolioId, refresh]);

  // Renderiza la tabla de posiciones abiertas
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Posiciones</h2>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Activo</th>
            <th className="py-2 px-4 border-b">Cantidad</th>
            <th className="py-2 px-4 border-b">Precio Promedio</th>
            <th className="py-2 px-4 border-b">Precio Actual</th>
            <th className="py-2 px-4 border-b">Valor Actual</th>
            <th className="py-2 px-4 border-b">Ganancia/Pérdida</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((pos) => {
            // Calcula el valor actual de la posición
            const valorActual = pos.cantidad * pos.precioActual;
            // Lógica de ganancia/pérdida para shorts:
            // Si la posición es de venta, la ganancia es (precio entrada - precio actual) * cantidad
            // Si es compra, (precio actual - precio entrada) * cantidad
            const isShort = pos.tipoOperacion === "Venta";
            const gananciaPerdida = isShort
              ? (pos.valorTotal / pos.cantidad - pos.precioActual) * pos.cantidad
              : valorActual - pos.valorTotal;
            return (
              <tr key={pos.symbol}>
                <td className="py-2 px-4 border-b">{pos.symbol}</td>
                <td className="py-2 px-4 border-b">{pos.cantidad}</td>
                <td className="py-2 px-4 border-b">
                  ${(pos.valorTotal / pos.cantidad).toFixed(2)}
                </td>
                <td className="py-2 px-4 border-b">
                  ${pos.precioActual.toFixed(2)}
                </td>
                <td className="py-2 px-4 border-b">
                  ${valorActual.toFixed(2)}
                </td>
                <td
                  className={`py-2 px-4 border-b ${
                    gananciaPerdida >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  ${gananciaPerdida.toFixed(2)}
                  {isShort && (
                    <span className="block text-xs text-blue-600">Short</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Positions;
