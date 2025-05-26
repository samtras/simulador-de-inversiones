import { useEffect, useState, useContext, forwardRef, useImperativeHandle } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { usePortfolio } from "../context/PortfolioContext";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, '');

/**
 * Componente PortfolioBalancePie
 * Muestra dos gráficos de torta:
 * 1. Distribución por activo (ej: Apple, Oro, BTC, etc.)
 * 2. Distribución por categoría (Acciones, Criptos, Forex, Materias Primas)
 */
const PortfolioBalancePie = forwardRef(({ refresh }, ref) => {
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

  // Agrupa activos (solo compras y efectivo)
  const activos = {};
  positions.forEach((order) => {
    if (order.tipoOperacion === "Compra") {
      const symbol = order.symbol;
      const precioActual = order.precioActual || order.precioEntrada;
      if (!activos[symbol]) activos[symbol] = 0;
      activos[symbol] += order.cantidad * precioActual;
    }
  });
  activos["Efectivo"] = cash;

  // Agrupa pasivos (solo shorts)
  const pasivos = {};
  positions.forEach((order) => {
    if (order.tipoOperacion === "Venta") {
      const symbol = order.symbol;
      const precioActual = order.precioActual || order.precioEntrada;
      if (!pasivos[symbol]) pasivos[symbol] = 0;
      pasivos[symbol] += order.cantidad * precioActual;
    }
  });

  // Por categoría
  const activosPorCategoria = {};
  Object.entries(activos).forEach(([symbol, valor]) => {
    if (symbol === "Efectivo") return;
    const cat = getCategory(symbol);
    if (!activosPorCategoria[cat]) activosPorCategoria[cat] = 0;
    activosPorCategoria[cat] += valor;
  });
  activosPorCategoria["Efectivo"] = cash;

  const pasivosPorCategoria = {};
  Object.entries(pasivos).forEach(([symbol, valor]) => {
    const cat = getCategory(symbol);
    if (!pasivosPorCategoria[cat]) pasivosPorCategoria[cat] = 0;
    pasivosPorCategoria[cat] += valor;
  });

  // Para exportar al resumen
  useImperativeHandle(ref, () => ({
    activos,
    pasivos,
    activosPorCategoria,
    pasivosPorCategoria,
    efectivo: cash
  }));

  // Gráficos
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Distribución de Activos</h2>
      <div className="text-xs text-gray-500 mb-2">
        * Solo incluye compras y efectivo.
      </div>
      {loading ? (
        <div>Cargando datos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-2">Por activo</h3>
            <Chart
              options={{
                labels: Object.keys(activos),
                legend: { position: "bottom" },
                dataLabels: { enabled: true, formatter: (v) => v.toFixed(2) + "%" },
              }}
              series={Object.values(activos)}
              type="pie"
              height={300}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">Por categoría</h3>
            <Chart
              options={{
                labels: Object.keys(activosPorCategoria),
                legend: { position: "bottom" },
                dataLabels: { enabled: true, formatter: (v) => v.toFixed(2) + "%" },
              }}
              series={Object.values(activosPorCategoria)}
              type="pie"
              height={300}
            />
          </div>
        </div>
      )}

      <h2 className="text-lg font-bold mb-4">Distribución de Pasivos</h2>
      <div className="text-xs text-gray-500 mb-2">
        * Solo incluye ventas en corto (shorts).
      </div>
      {loading ? (
        <div>Cargando datos...</div>
      ) : Object.keys(pasivos).length === 0 ? (
        <div>No tienes posiciones en corto.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold mb-2">Por pasivo (short)</h3>
            <Chart
              options={{
                labels: Object.keys(pasivos),
                legend: { position: "bottom" },
                dataLabels: { enabled: true, formatter: (v) => v.toFixed(2) + "%" },
              }}
              series={Object.values(pasivos)}
              type="pie"
              height={300}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">Por categoría</h3>
            <Chart
              options={{
                labels: Object.keys(pasivosPorCategoria),
                legend: { position: "bottom" },
                dataLabels: { enabled: true, formatter: (v) => v.toFixed(2) + "%" },
              }}
              series={Object.values(pasivosPorCategoria)}
              type="pie"
              height={300}
            />
          </div>
        </div>
      )}
    </div>
  );
});

export default PortfolioBalancePie;
