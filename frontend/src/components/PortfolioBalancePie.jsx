import { useEffect, useState, useContext } from "react";
import Chart from "react-apexcharts";
import axios from "axios";

const API_URL = import.meta.env.BACKEND_API_URL || "http://localhost:5000/api";

import { AuthContext } from "../context/AuthContext";
import { usePortfolio } from "../context/PortfolioContext";

/**
 * Componente PortfolioBalancePie
 * Muestra dos gráficos de torta:
 * 1. Distribución por activo (ej: Apple, Oro, BTC, etc.)
 * 2. Distribución por categoría (Acciones, Criptos, Forex, Materias Primas)
 */
const PortfolioBalancePie = ({ refresh }) => {
  const { user } = useContext(AuthContext);
  const { selectedPortfolioId } = usePortfolio();
  const [positions, setPositions] = useState([]);
  const [portfolioBalance, setPortfolioBalance] = useState(0); // Saldo disponible real
  const [loading, setLoading] = useState(true);
  const [cash, setCash] = useState(0); // Fondo disponible real

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      if (!user?.id || !selectedPortfolioId) return;
      try {
        // 1. Intenta obtener solo órdenes abiertas
        let res = await axios.get(
          `${API_URL}/orders/portfolio/${selectedPortfolioId}?estado=Abierta`
        );
        let openOrders = res.data.filter((order) => order.estado === "Abierta");
        // 2. Si no hay órdenes abiertas, busca en el historial las que no tengan fechaCierre
        if (openOrders.length === 0) {
          res = await axios.get(
            `${API_URL}/orders/portfolio/${selectedPortfolioId}`
          );
          openOrders = res.data.filter((order) => !order.fechaCierre || order.fechaCierre === "N/A");
        }
        setPositions(openOrders);
      } catch {
        setPositions([]);
      }
      setLoading(false);
    };
    fetchOrders();
  }, [user, selectedPortfolioId, refresh]);

  useEffect(() => {
    // Obtener el saldo disponible real del portafolio
    const fetchPortfolio = async () => {
      if (!selectedPortfolioId) return;
      try {
        const res = await axios.get(`${API_URL}/portfolios/${selectedPortfolioId}`);
        setPortfolioBalance(res.data.balance ?? 0);
        setCash(res.data.fondoDisponible ?? 0); // Obtener fondoDisponible real
      } catch {
        setPortfolioBalance(0);
        setCash(0);
      }
    };
    fetchPortfolio();
  }, [selectedPortfolioId, refresh]);

  // Utilidad para mapear símbolos a categorías
  const getCategory = (symbol) => {
    if (!symbol) return "Otro";
    // Criptos
    if (symbol.endsWith("USD") && [
      "BTC", "ETH", "USDT", "BNB", "SOL", "USDC", "XRP", "DOGE", "TON", "TRX", "ADA", "AVAX", "SHIB", "LINK", "DOT", "BCH", "DAI", "LEO", "LTC", "NEAR", "KAS", "UNI", "ICP", "FET", "XMR", "PEPE", "SUI", "APT", "XLM", "POL", "FDUSD", "ETC", "OKB", "STX", "TAO", "CRO", "AAVE", "FIL", "IMX", "HBAR", "MNT", "INJ", "ARB", "VET", "OP", "ATOM", "WIF", "FTM", "MKR", "GRT", "RUNE", "THETA", "BGB", "AR", "MATIC", "HNT", "BONK", "FLOKI", "ALGO", "SEI", "PYTH", "JUP", "TIA", "JASMY", "KCS", "BSV", "OM", "LDO", "QNT", "ONDO", "BTT", "FLOW", "CORE", "PYUSD", "NOT", "BRETT", "USDD", "GT", "EOS", "FLR", "BEAM", "CKB", "POPCAT", "STRK", "EGLD", "AXS", "NEO", "ORDI", "WLD", "XTZ", "GALA", "XEC", "CFX", "AKT", "SAND", "DYDX", "BNX"
    ].some((c) => symbol.startsWith(c))) return "Criptos";
    // Forex
    if (["EURUSD", "USDJPY", "GBPUSD", "USDCHF", "AUDUSD", "USDCAD", "NZDUSD", "EURGBP", "EURJPY", "GBPJPY", "USDHKD", "USDSEK", "USDSGD", "USDZAR", "USDTRY", "USDNOK", "USDINR", "USDMXN", "USDPLN", "USDTHB", "USDILS", "USDIDR", "USDHUF", "USDCZK", "USDDKK", "USDCLP", "USDARS", "USDPEN", "USDVND", "USDNGN", "USDQAR", "USDKRW", "USDRUB", "USDHRK", "USDISK", "USDKZT", "USDMYR", "USDPHP", "USDSAR", "USDTWD", "USDUAH", "USDVEF", "USDXAG", "USDXAU"].includes(symbol)) return "Forex";
    // Commodities
    if (["BZUSD", "SIUSD", "ESUSD", "GCUSD"].includes(symbol)) return "Materias Primas";
    // Acciones (por defecto si no es ninguna de las anteriores)
    return "Acciones";
  };

  // Agrupa por símbolo y calcula la cantidad y valor neto de cada activo
  const groupedBySymbol = {};
  let totalActivos = 0;
  positions.forEach((order) => {
    const symbol = order.symbol;
    const isShort = order.tipoOperacion === "Venta";
    const cantidad = isShort ? -order.cantidad : order.cantidad;
    const precioActual = order.precioActual || order.precioEntrada;
    if (!groupedBySymbol[symbol]) {
      groupedBySymbol[symbol] = { cantidad: 0, valor: 0 };
    }
    groupedBySymbol[symbol].cantidad += cantidad;
    groupedBySymbol[symbol].valor += cantidad * precioActual;
  });

  // Solo activos con cantidad neta distinta de 0
  const groupedBySymbolFiltered = Object.fromEntries(
    Object.entries(groupedBySymbol)
      .filter(([_, data]) => Math.abs(data.cantidad) > 0.00001)
      .map(([symbol, data]) => [symbol, data.valor])
  );
  totalActivos = Object.values(groupedBySymbolFiltered).reduce((a, b) => a + b, 0);
  const groupedBySymbolWithCash = { ...groupedBySymbolFiltered, "Efectivo": cash };

  // Agrupa por categoría usando la utilidad y solo activos netos
  const groupedByCategory = {};
  Object.entries(groupedBySymbolFiltered).forEach(([symbol, valor]) => {
    const cat = getCategory(symbol);
    if (!groupedByCategory[cat]) groupedByCategory[cat] = 0;
    groupedByCategory[cat] += valor;
  });
  const groupedByCategoryWithCash = { ...groupedByCategory, "Efectivo": cash };

  // Si el total es 0, muestra igual la porción de efectivo
  const totalParaGraficos = Object.values(groupedBySymbolWithCash).reduce((a, b) => a + b, 0);

  // Si no hay posiciones activas, solo mostrar efectivo
  if (!positions || positions.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4">Distribución del Portafolio</h2>
        <div className="text-xs text-gray-500 mb-2">
          * Solo tienes efectivo disponible en este portafolio.
        </div>
        <Chart
          options={{
            labels: ["Efectivo"],
            legend: { position: "bottom" },
            dataLabels: { enabled: true, formatter: (v) => v.toFixed(2) + "%" },
          }}
          series={[100]}
          type="pie"
          height={300}
        />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Distribución del Portafolio</h2>
      <div className="text-xs text-gray-500 mb-2">
        * En los gráficos, las posiciones en corto solo suman si están en ganancia. El saldo disponible siempre se muestra como "Efectivo".
      </div>
      {loading ? (
        <div>Cargando datos...</div>
      ) : totalParaGraficos === 0 ? (
        <div>No hay posiciones abiertas ni saldo en este portafolio.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold mb-2">Por activo</h3>
            <Chart
              options={{
                labels: Object.keys(groupedBySymbolWithCash),
                legend: { position: "bottom" },
                dataLabels: { enabled: true, formatter: (v) => v.toFixed(2) + "%" },
              }}
              series={Object.values(groupedBySymbolWithCash).map((v) => ((v / totalParaGraficos) * 100))}
              type="pie"
              height={300}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">Por categoría</h3>
            <Chart
              options={{
                labels: Object.keys(groupedByCategoryWithCash),
                legend: { position: "bottom" },
                dataLabels: { enabled: true, formatter: (v) => v.toFixed(2) + "%" },
              }}
              series={Object.values(groupedByCategoryWithCash).map((v) => ((v / totalParaGraficos) * 100))}
              type="pie"
              height={300}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioBalancePie;
