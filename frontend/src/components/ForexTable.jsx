import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.BACKEND_API_URL || "http://localhost:5000/api";

const FOREX_SYMBOLS = [
  "USDCAD", "EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCHF", "NZDUSD", "USDCNY", "USDMXN", "USDINR"
];

const ForexTable = ({ onSelect }) => {
  const [forex, setForex] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchForex = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${API_URL}/market-data/forex`
        );
        setForex(response.data);
      } catch (err) {
        setError("Error al cargar los datos de forex.");
      } finally {
        setLoading(false);
      }
    };
    fetchForex();
  }, []);

  if (loading) return <div className="p-4">Cargando forex...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold mb-2">Forex</h2>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Símbolo</th>
            <th className="py-2 px-4 border-b">Precio</th>
            <th className="py-2 px-4 border-b">Cambio</th>
            <th className="py-2 px-4 border-b">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {(Array.isArray(forex) ? forex : []).map((item) => (
            <tr key={item.symbol}>
              <td className="py-2 px-4 border-b">{item.symbol}</td>
              <td className="py-2 px-4 border-b">${item.price?.toFixed(5) ?? "-"}</td>
              <td className={`py-2 px-4 border-b ${item.change > 0 ? "text-green-500" : "text-red-500"}`}>
                {item.change?.toFixed(5) ?? "-"}
              </td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => onSelect(item)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  Ver gráfico
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ForexTable;
