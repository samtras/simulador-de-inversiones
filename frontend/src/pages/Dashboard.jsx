// -----------------------------------------------------------------------------
// Archivo: Dashboard.jsx
// Descripción: Página principal del usuario autenticado. Muestra la tabla de activos,
// permite seleccionar activos, operar y visualizar el portafolio y gráficos.
// -----------------------------------------------------------------------------

import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import TradingWindow from "../components/TradingWindow";
import CandlestickChart from "../components/CandlestickChart";
import { useNavigate, useOutletContext } from "react-router-dom";
import CommoditiesTable from "../components/CommoditiesTable";
import CryptosTable from "../components/CryptosTable";
import ForexTable from "../components/ForexTable";
import { usePortfolio } from "../context/PortfolioContext";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, '');

const Dashboard = () => {
  const [marketData, setMarketData] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [newPortfolioName, setNewPortfolioName] = useState("");
  const [creatingPortfolio, setCreatingPortfolio] = useState(false);
  const [search, setSearch] = useState("");
  const [assetType, setAssetType] = useState("stocks"); // stocks, commodities, forex, cryptos
  const [refresh, setRefresh] = useState(0); // Estado de refresco global

  const { availableBalance, selectedPortfolioId } = usePortfolio(); // Usa el portafolio activo del contexto global
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const handleBalanceUpdate = outletContext?.handleBalanceUpdate;

  // Nuevo: estado de carga y control de portafolio seleccionado
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      console.warn("Usuario no autenticado. Redirigiendo a login...");
      navigate("/login");
      return;
    }

    const fetchMarketData = async () => {
      try {
        const response = await axios.get(`${API_URL}/market-data`);
        if (response.status === 200 && Array.isArray(response.data)) {
          setMarketData(response.data);
        } else {
          console.warn("No se encontraron datos de mercado.");
        }
      } catch (error) {
        console.error("Error obteniendo datos de mercado:", error.message);
      } finally {
        setLoading(false); // <-- Solo aquí
      }
    };

    fetchMarketData();
    // Quitar fetchUserBalance(); aquí
  }, [user, navigate]);

  const handleAssetSelect = (asset) => {
    setSelectedAsset(asset);
  };

  const handleBackToList = () => {
    setSelectedAsset(null);
  };

  // Filtrar activos por búsqueda
  const filteredMarketData = marketData.filter((item) => {
    if (!item || !item.name || !item.symbol) return false;
    const searchLower = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchLower) ||
      item.symbol.toLowerCase().includes(searchLower)
    );
  });

  // Callback para refrescar gráficos y órdenes tras operar
  const handleTradeExecuted = () => setRefresh((r) => r + 1);

  // Mostrar loader si está cargando o no hay portafolio seleccionado
  if (loading || !selectedPortfolioId) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[300px]">
        <div className="text-lg text-gray-600">
          {loading
            ? "Cargando datos del mercado..."
            : "Selecciona un portafolio activo para comenzar."}
        </div>
      </div>
    );
  }

  if (selectedAsset) {
    return (
      <div className="flex w-full">
        <div className="flex-1 p-4">
          <button
            onClick={handleBackToList}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
          >
            Volver al listado
          </button>
          <CandlestickChart
            assetName={selectedAsset.name || selectedAsset.symbol}
            symbol={selectedAsset.symbol}
          />
        </div>
        <div className="w-[400px] p-4 border-l bg-gray-100">
          <TradingWindow
            selectedAsset={selectedAsset}
            availableBalance={availableBalance}
            onTradeExecuted={handleTradeExecuted}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4">
      <h2 className="text-lg font-bold mb-4">Activos Financieros</h2>
      {/* Buscador y selector de tipo de activo */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar activo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="p-2 border rounded-md w-full md:w-64"
        />
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded ${assetType === "stocks" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => setAssetType("stocks")}
          >
            Acciones
          </button>
          <button
            className={`px-4 py-2 rounded ${assetType === "forex" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => setAssetType("forex")}
          >
            Forex
          </button>
          <button
            className={`px-4 py-2 rounded ${assetType === "cryptos" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => setAssetType("cryptos")}
          >
            Criptos
          </button>
          <button
            className={`px-4 py-2 rounded ${assetType === "commodities" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => setAssetType("commodities")}
          >
            Materias Primas
          </button>
        </div>
      </div>
      {/* Tabla de activos según tipo */}
      <div className="flex-1 p-4 overflow-auto">
        {assetType === "stocks" && (
          <>
            <table className="min-w-full bg-white border mb-8">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Nombre del activo</th>
                  <th className="py-2 px-4 border-b">Precio actual</th>
                  <th className="py-2 px-4 border-b">Precio anterior</th>
                  <th className="py-2 px-4 border-b">Cambio</th>
                  <th className="py-2 px-4 border-b">Variación (%)</th>
                  <th className="py-2 px-4 border-b">Acciones</th>
                  <th className="py-2 px-4 border-b">Simular</th>
                </tr>
              </thead>
              <tbody>
                {filteredMarketData.map((item) => {
                  if (!item || !item.name || !item.price || !item.previousClose) {
                    return null;
                  }
                  return (
                    <tr key={item.symbol}>
                      <td className="py-2 px-4 border-b">{item.name}</td>
                      <td className="py-2 px-4 border-b">${item.price.toFixed(2)}</td>
                      <td className="py-2 px-4 border-b">${item.previousClose.toFixed(2)}</td>
                      <td
                        className={`py-2 px-4 border-b ${item.change > 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        ${item.change.toFixed(2)}
                      </td>
                      <td
                        className={`py-2 px-4 border-b ${item.changesPercentage > 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {item.changesPercentage.toFixed(2)}%
                      </td>
                      <td className="py-2 px-4 border-b">
                        <button
                          onClick={() => handleAssetSelect(item)}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          Operar
                        </button>
                      </td>
                      <td className="py-2 px-4 border-b">
                        <button
                          onClick={() => navigate(`/simulacion?symbol=${item.symbol}`)}
                          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                        >
                          Simular
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
        {assetType === "commodities" && (
          <CommoditiesTable onSelect={handleAssetSelect} />
        )}
        {assetType === "cryptos" && (
          <CryptosTable onSelect={handleAssetSelect} />
        )}
        {assetType === "forex" && (
          <ForexTable onSelect={handleAssetSelect} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;