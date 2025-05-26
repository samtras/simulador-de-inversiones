import { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { usePortfolio } from "../context/PortfolioContext";
import PortfolioBalancePie from "../components/PortfolioBalancePie";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, '');

const Portfolios = () => {
  const { user } = useContext(AuthContext);
  const { selectedPortfolioId, setSelectedPortfolioId } = usePortfolio();
  const [portfolios, setPortfolios] = useState([]);
  const [newPortfolioName, setNewPortfolioName] = useState("");
  const [initialBalance, setInitialBalance] = useState(10000);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  // Para mostrar resumen
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  // Ref para acceder a los datos de PortfolioBalancePie
  const pieRef = useRef();

  // Actualiza activos/pasivos/efectivo y balance automáticamente al cambiar portafolio, refresh o cuando el gráfico se monta
  useEffect(() => {
    const interval = setInterval(() => {
      if (pieRef.current) {
        setActivos(pieRef.current.activos || {});
        setPasivos(pieRef.current.pasivos || {});
        setEfectivo(pieRef.current.efectivo || 0);
      }
    }, 300); // chequea cada 300ms mientras la página está activa

    return () => clearInterval(interval);
  }, [selectedPortfolioId, refresh]);

  // Obtener portafolios del usuario
  const fetchPortfolios = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/portfolios/user/${user.id}`);
      setPortfolios(res.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setPortfolios([]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.id) fetchPortfolios();
    // eslint-disable-next-line
  }, [user]);

  // Guardar selección en contexto global
  const handleSelectPortfolio = (portfolioId) => {
    setSelectedPortfolioId(portfolioId);
  };

  // Crear portafolio
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newPortfolioName.trim()) return;
    setCreating(true);
    try {
      await axios.post(`${API_URL}/portfolios`, {
        userId: user.id,
        name: newPortfolioName,
        fondoDisponible: initialBalance, // <-- usa fondoDisponible
        balance: initialBalance
      });
      setNewPortfolioName("");
      setInitialBalance(10000);
      fetchPortfolios();
    } catch {
      alert("Error al crear portafolio");
    }
    setCreating(false);
  };

  // Eliminar portafolio
  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este portafolio?")) return;
    try {
      await axios.delete(`${API_URL}/portfolios/${id}`);
      // Si el portafolio eliminado era el seleccionado, limpiar selección
      if (selectedPortfolioId === id) {
        setSelectedPortfolioId("");
        localStorage.removeItem("selectedPortfolio");
      }
      fetchPortfolios();
    } catch {
      alert("Error al eliminar portafolio");
    }
  };

  // Balance total de todos los portafolios (nuevo: activos - pasivos)
  const [activos, setActivos] = useState({});
  const [pasivos, setPasivos] = useState({});
  const [efectivo, setEfectivo] = useState(0);

  // Calcula el balance del portafolio seleccionado
  const selectedPortfolioObj = (Array.isArray(portfolios) ? portfolios : []).find((p) => p._id === selectedPortfolioId);
  const activosSum = Object.values(activos).reduce((a, b) => a + b, 0);
  const pasivosSum = Object.values(pasivos).reduce((a, b) => a + b, 0);
  const selectedBalance = activosSum - pasivosSum;

  // Callback para refrescar gráficos tras operar
  const handleTradeOrOrder = () => setRefresh((r) => r + 1);

  // Mostrar resumen de activos/pasivos/balance
  const handleShowSummary = () => {
    if (pieRef.current) {
      setActivos(pieRef.current.activos || {});
      setPasivos(pieRef.current.pasivos || {});
      setEfectivo(pieRef.current.efectivo || 0);
      setSummaryData({
        activos: pieRef.current.activos || {},
        pasivos: pieRef.current.pasivos || {},
        balance: Object.values(pieRef.current.activos || {}).reduce((a, b) => a + b, 0)
               - Object.values(pieRef.current.pasivos || {}).reduce((a, b) => a + b, 0),
      });
      setShowSummary(true);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Portafolios</h2>
      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newPortfolioName}
          onChange={e => setNewPortfolioName(e.target.value)}
          placeholder="Nombre del portafolio"
          className="p-2 border rounded-md"
        />
        <input
          type="number"
          value={initialBalance}
          min={0}
          onChange={e => setInitialBalance(Number(e.target.value))}
          placeholder="Saldo inicial"
          className="p-2 border rounded-md"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          disabled={creating}
        >
          Crear
        </button>
      </form>
      <div className="mb-4">
        <strong>Selecciona tu portafolio activo:</strong>
        <select
          value={selectedPortfolioId}
          onChange={e => handleSelectPortfolio(e.target.value)}
          className="ml-2 p-2 border rounded-md"
        >
          <option value="">-- Selecciona --</option>
          {(Array.isArray(portfolios) ? portfolios : []).map((p) => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
      </div>
      {selectedPortfolioId && (
        <div className="mb-4">
          <strong>Balance del portafolio seleccionado:</strong> ${selectedBalance.toFixed(2)}
          <br />
          <strong>Dinero disponible (efectivo):</strong> ${efectivo.toFixed(2)}
        </div>
      )}
      <PortfolioBalancePie ref={pieRef} refresh={refresh} />
      {loading ? (
        <div className="min-w-full bg-white border">
          <div>Cargando portafolios...</div>
        </div>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="py-2 px-4 border-b">
              <th className="py-2 px-4 border-b">Nombre</th>
              <th className="py-2 px-4 border-b">Balance</th>
              <th className="py-2 px-4 border-b">Acciones</th>
              <th className="py-2 px-4 border-b">Ver resumen</th>
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(portfolios) ? portfolios : []).length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4">No tienes portafolios aún.</td>
              </tr>
            ) : (
              (Array.isArray(portfolios) ? portfolios : []).map((p) => (
                <tr key={p._id}>
                  <td className="py-2 px-4 border-b">{p.name}</td>
                  <td className="py-2 px-4 border-b">
                    {selectedPortfolioId === p._id
                      ? `$${selectedBalance.toFixed(2)}`
                      : "--"}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Eliminar
                    </button>
                  </td>
                  <td className="py-2 px-4 border-b">
                    {selectedPortfolioId === p._id && (
                      <button
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        onClick={handleShowSummary}
                      >
                        Ver resumen
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Modal/resumen simple */}
      {showSummary && summaryData && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Resumen del Portafolio</h3>
            <div className="mb-2">
              <strong>Activos:</strong>
              <ul className="ml-4 list-disc">
                {Object.entries(summaryData.activos).map(([k, v]) => (
                  <li key={k}>{k}: ${v.toFixed(2)}</li>
                ))}
              </ul>
            </div>
            <div className="mb-2">
              <strong>Pasivos:</strong>
              <ul className="ml-4 list-disc">
                {Object.entries(summaryData.pasivos).length === 0
                  ? <li>No hay pasivos</li>
                  : Object.entries(summaryData.pasivos).map(([k, v]) => (
                      <li key={k}>{k}: -${v.toFixed(2)}</li>
                    ))}
              </ul>
            </div>
            <div className="mb-2">
              <strong>Balance:</strong> ${summaryData.balance.toFixed(2)}
            </div>
            <button
              className="mt-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              onClick={() => setShowSummary(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolios;