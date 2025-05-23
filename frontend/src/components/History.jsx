// -----------------------------------------------------------------------------
// Archivo: History.jsx
// Descripción: Componente que muestra el historial de operaciones cerradas del usuario.
// Presenta información como símbolo, tipo de operación, cantidad, precios y resultado.
// -----------------------------------------------------------------------------

import { useEffect, useState, useContext } from "react";
import axios from "axios";

const API_URL = import.meta.env.BACKEND_API_URL || "http://localhost:5000/api";

import { AuthContext } from "../context/AuthContext";
import { usePortfolio } from "../context/PortfolioContext";

/**
 * Componente History
 * Muestra una tabla con el historial de operaciones cerradas del usuario.
 * Utiliza el contexto de autenticación para obtener el usuario actual y consulta la API para obtener las órdenes cerradas.
 */
const History = () => {
  // Obtiene el usuario autenticado del contexto
  const { user } = useContext(AuthContext);
  const { selectedPortfolioId } = usePortfolio();
  // Estado para almacenar el historial de órdenes cerradas
  const [history, setHistory] = useState([]);

  /**
   * useEffect para cargar el historial de órdenes cerradas al montar el componente o cambiar el usuario.
   * Llama a la API para obtener las órdenes cerradas y las almacena en el estado.
   */
  useEffect(() => {
    /**
     * fetchHistory
     * Función asíncrona que obtiene las órdenes cerradas del usuario desde la API.
     * - Si el usuario no está autenticado, no hace nada.
     * - Maneja errores de red o de la API.
     */
    const fetchHistory = async () => {
      if (!user?.id || !selectedPortfolioId) return;

      try {
        const response = await axios.get(
          `${API_URL}/orders/portfolio/${selectedPortfolioId}?estado=Cerrada`
        );
        setHistory(response.data);
      } catch (error) {
        console.error("Error obteniendo historial:", error.message);
      }
    };

    fetchHistory();
  }, [user, selectedPortfolioId]);

  // Renderiza la tabla de historial de operaciones cerradas
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Historial</h2>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Activo</th>
            <th className="py-2 px-4 border-b">Tipo</th>
            <th className="py-2 px-4 border-b">Cantidad</th>
            <th className="py-2 px-4 border-b">Precio Entrada</th>
            <th className="py-2 px-4 border-b">Precio Salida</th>
            <th className="py-2 px-4 border-b">Resultado</th>
            <th className="py-2 px-4 border-b">Fecha Apertura</th>
            <th className="py-2 px-4 border-b">Fecha Cierre</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry) => (
            <tr key={entry._id}>
              <td className="py-2 px-4 border-b">{entry.symbol}</td>
              <td
                className={`py-2 px-4 border-b ${
                  entry.tipoOperacion === "Compra" ? "text-green-500" : "text-red-500"
                }`}
              >
                {entry.tipoOperacion}
              </td>
              <td className="py-2 px-4 border-b">{entry.cantidad}</td>
              <td className="py-2 px-4 border-b">${entry.precioEntrada.toFixed(2)}</td>
              <td className="py-2 px-4 border-b">${entry.precioSalida?.toFixed(2) || "0.00"}</td>
              <td
                className={`py-2 px-4 border-b ${
                  entry.resultado >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                ${entry.resultado?.toFixed(2) || "0.00"}
              </td>
              <td className="py-2 px-4 border-b">
                {entry.fechaCreacion ? new Date(entry.fechaCreacion).toLocaleDateString() : "N/A"}
              </td>
              <td className="py-2 px-4 border-b">
                {entry.fechaCierre ? new Date(entry.fechaCierre).toLocaleDateString() : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default History;
