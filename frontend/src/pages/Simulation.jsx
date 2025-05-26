import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Chart from "react-apexcharts";
import { AuthContext } from "../context/AuthContext";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, '');

const Simulation = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const querySymbol = new URLSearchParams(location.search).get("symbol");

  const [symbol] = useState(querySymbol || "AAPL");
  const [historical, setHistorical] = useState([]);
  const [simData, setSimData] = useState([]);
  const [step, setStep] = useState(0);
  const [balance, setBalance] = useState(10000);
  const [position, setPosition] = useState(null);
  const [log, setLog] = useState([]);
  const [buyQty, setBuyQty] = useState("");
  const [volatility, setVolatility] = useState(2);
  const [jump, setJump] = useState(1);
  const [candlesToShow, setCandlesToShow] = useState(30); // cantidad de velas a mostrar
  const [showOptions, setShowOptions] = useState(false);

  // Al cargar la simulación, se obtienen los últimos 60 días de históricos del activo seleccionado:
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Pide los últimos 365 días (1 año) de datos históricos
        const res = await axios.get(`${API_URL}/market-data/historical/${symbol}?interval=365`);
        let data = Array.isArray(res.data) ? [...res.data] : [];
        // Ordena los datos por fecha ascendente (más antiguo primero)
        data.sort((a, b) => new Date(a.x || a.date) - new Date(b.x || b.date));
        // Filtra para que solo queden datos desde hace exactamente 1 año hasta hoy
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const filtered = data.filter(d => {
          const date = new Date(d.x || d.date);
          return date >= oneYearAgo;
        });
        setHistorical(filtered);
        setSimData([]);
        setStep(0);
        setBalance(10000);
        setPosition(null);
        setLog([]);
        setBuyQty("");
      } catch {
        setHistorical([]);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, [symbol]);

  // Avanza un paso en la simulación
  const nextStep = () => {
    if (step >= historical.length) return;
    let newSimData = [...simData];
    let newStep = step;
    for (let i = 0; i < jump && newStep < historical.length; i++) {
      const prev = newSimData.length ? newSimData[newSimData.length - 1].y[3] : historical[0].y[3];
      const base = historical[newStep]?.y[3] || prev;
      const simulatedClose = base * (1 + (Math.random() - 0.5) * (volatility / 100));
      const simulated = {
        ...historical[newStep],
        y: [
          base * (1 + (Math.random() - 0.5) * (volatility / 100)),
          base * (1 + (Math.random() - 0.5) * (volatility / 100)),
          base * (1 + (Math.random() - 0.5) * (volatility / 100)),
          simulatedClose,
        ],
      };
      newSimData.push(simulated);
      newStep++;
    }
    setSimData(newSimData);
    setStep(newStep);
  };

  // Acciones del usuario
  const handleBuy = () => {
    if (position) return;
    const price = simData[simData.length - 1]?.y[3];
    const qty = Math.floor(Number(buyQty));
    const fecha = simData[simData.length - 1]?.x
      ? new Date(simData[simData.length - 1].x).toLocaleDateString(undefined, { day: "2-digit", month: "2-digit" })
      : "";
    if (qty > 0 && qty * price <= balance) {
      setPosition({ type: "buy", price, qty });
      setBalance(balance - qty * price);
      setLog(prev => [
        `Compraste ${qty} a $${price.toFixed(2)} el ${fecha}`,
        ...prev
      ]);
      setBuyQty("");
    }
  };
  const handleSell = () => {
    if (!position) return;
    const price = simData[simData.length - 1]?.y[3];
    const fecha = simData[simData.length - 1]?.x
      ? new Date(simData[simData.length - 1].x).toLocaleDateString(undefined, { day: "2-digit", month: "2-digit" })
      : "";
    setBalance(balance + position.qty * price);
    setLog(prev => [
      `Vendiste ${position.qty} a $${price.toFixed(2)} el ${fecha}. Ganancia: $${((price - position.price) * position.qty).toFixed(2)}`,
      ...prev
    ]);
    setPosition(null);
  };
  const handleSkip = () => {
    nextStep();
  };

  return (
    <div className="p-4">
      <button
        className="mb-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        onClick={() => navigate("/dashboard")}
      >
        Volver al Dashboard
      </button>
      <h2 className="text-lg font-bold mb-4">Simulación de Escenarios</h2>
      <div className="mb-2 flex items-center gap-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => setShowOptions(true)}
        >
          Opciones
        </button>
      </div>
      {/* Modal de opciones */}
      {showOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-xs w-full">
            <h3 className="text-lg font-bold mb-4">Opciones de Simulación</h3>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Volatilidad (%)</label>
              <input
                type="number"
                min={0}
                max={20}
                step={0.1}
                value={volatility}
                onChange={e => setVolatility(Number(e.target.value))}
                className="p-2 border rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Salto</label>
              <select
                className="p-2 border rounded w-full"
                value={jump}
                onChange={e => setJump(Number(e.target.value))}
              >
                <option value={1}>1 día</option>
                <option value={2}>2 días</option>
                <option value={3}>3 días</option>
                <option value={7}>1 semana</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Velas en pantalla</label>
              <input
                type="number"
                min={1}
                max={simData.length || 1}
                value={candlesToShow}
                onChange={e => setCandlesToShow(Number(e.target.value))}
                className="p-2 border rounded w-full"
              />
            </div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded w-full"
              onClick={() => setShowOptions(false)}
            >
              Guardar
            </button>
          </div>
        </div>
      )}
      <div className="mb-2">
        <strong>Activo:</strong> {symbol}
      </div>
      <div className="mb-2">
        <strong>Balance:</strong> ${balance.toFixed(2)}
        {position && (
          <span className="ml-4">
            <strong>Posición:</strong> {position.qty} @ ${position.price.toFixed(2)}
          </span>
        )}
      </div>
      <div className="mb-4">
        <Chart
          options={{
            chart: { type: "candlestick" },
            xaxis: { type: "datetime" },
          }}
          series={[{ data: simData.slice(-candlesToShow) }]}
          type="candlestick"
          height={300}
        />
      </div>
      <div className="mb-4 flex gap-2 items-center">
        {!position && (
          <>
            <input
              type="number"
              min={1}
              placeholder="Cantidad"
              value={buyQty}
              onChange={e => setBuyQty(e.target.value)}
              className="p-2 border rounded w-24"
            />
            <button
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={handleBuy}
              disabled={!buyQty || Number(buyQty) <= 0 || !simData.length || (simData[simData.length - 1]?.y[3] * Number(buyQty) > balance)}
            >
              Comprar
            </button>
          </>
        )}
        {position && (
          <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={handleSell}>
            Vender
          </button>
        )}
        <button className="bg-gray-600 text-white px-4 py-2 rounded" onClick={handleSkip}>
          Siguiente
        </button>
      </div>
      <div className="bg-gray-100 p-2 rounded" style={{ maxHeight: 180, overflowY: "auto" }}>
        <strong>Historial de decisiones:</strong>
        <ul className="list-disc ml-6">
          {log.map((l, i) => <li key={i}>{l}</li>)}
        </ul>
      </div>
    </div>
  );
};

export default Simulation;
