// -----------------------------------------------------------------------------
// Archivo: CommoditiesTable.jsx
// Descripción: Tabla para mostrar commodities disponibles (BZUSD, SIUSD, ESUSD, GCUSD)
// -----------------------------------------------------------------------------
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, '');

const COMMODITY_SYMBOLS = ["BZUSD", "SIUSD", "ESUSD", "GCUSD"];

const CommoditiesTable = ({ onSelect }) => {
  const [commodities, setCommodities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCommodities = async () => {
      setLoading(true);
      setError(null);
      try {
        // Consultar al backend, no a la API de FMP directamente
        const response = await axios.get(
          `${API_URL}/market-data/commodities`
        );
        setCommodities(response.data);
      } catch (err) {
        setError("Error al cargar los datos de commodities.");
      } finally {
        setLoading(false);
      }
    };
    fetchCommodities();
  }, []);

  if (loading) return <div className="p-4">Cargando commodities...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold mb-2">Commodities</h2>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Símbolo</th>
            <th className="py-2 px-4 border-b">Precio</th>
            <th className="py-2 px-4 border-b">Cambio</th>
            <th className="py-2 px-4 border-b">Operar</th>
            <th className="py-2 px-4 border-b">Simular</th>
          </tr>
        </thead>
        <tbody>
          {(Array.isArray(commodities) ? commodities : []).map((item) => (
            <tr key={item.symbol}>
              <td className="py-2 px-4 border-b">{item.symbol}</td>
              <td className="py-2 px-4 border-b">${item.price?.toFixed(2) ?? "-"}</td>
              <td className={`py-2 px-4 border-b ${item.change > 0 ? "text-green-500" : "text-red-500"}`}>
                {item.change?.toFixed(2) ?? "-"}
              </td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => onSelect(item)}
                  className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                >
                  Operar
                </button>
              </td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => navigate(`/simulacion?symbol=${item.symbol}`)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Simular
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CommoditiesTable;
