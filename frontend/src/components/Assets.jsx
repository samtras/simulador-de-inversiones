// -----------------------------------------------------------------------------
// Archivo: Assets.jsx
// Descripción: Componente que muestra la lista de activos disponibles para operar.
// Permite seleccionar un activo para ver su gráfico o iniciar una operación de compra.
// Muestra información relevante como precio actual y variación.
// -----------------------------------------------------------------------------

import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.BACKEND_API_URL || "http://localhost:5000/api";

const Assets = ({ onSelectAsset }) => {
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await axios.get(`${API_URL}/assets`);
        setAssets(response.data);
      } catch (error) {
        console.error("Error obteniendo activos:", error.message);
      }
    };

    fetchAssets();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Activos Disponibles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset) => (
          <div key={asset.symbol} className="p-4 border rounded-md bg-white shadow">
            <h3 className="text-md font-bold">{asset.name}</h3>
            <p className="text-sm text-gray-600">Ticker: {asset.symbol}</p>
            <p className="text-sm">Precio Actual: ${asset.price.toFixed(2)}</p>
            <p
              className={`text-sm ${
                asset.change >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              Variación: {asset.change.toFixed(2)}%
            </p>
            <div className="mt-2 flex space-x-2">
              <button
                onClick={() => onSelectAsset(asset)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Ver Gráfico
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Comprar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Assets;
