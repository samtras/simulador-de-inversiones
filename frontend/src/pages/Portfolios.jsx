import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { usePortfolio } from "../context/PortfolioContext";
import PortfolioBalancePie from "../components/PortfolioBalancePie";
import Orders from "../components/Orders";

const API_URL = import.meta.env.BACKEND_API_URL || "http://localhost:5000/api";

const Portfolios = () => {
  const { user } = useContext(AuthContext);
  const { selectedPortfolioId, setSelectedPortfolioId } = usePortfolio();
  const [portfolios, setPortfolios] = useState([]);
  const [newPortfolioName, setNewPortfolioName] = useState("");
  const [initialBalance, setInitialBalance] = useState(10000);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

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
        fondoDisponible: initialBalance,
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

  // Balance total de todos los portafolios
  const totalBalance = (Array.isArray(portfolios) ? portfolios : []).reduce((acc, p) => acc + (p.balance || 0), 0);
  // Balance del portafolio seleccionado
  const selectedPortfolioObj = (Array.isArray(portfolios) ? portfolios : []).find((p) => p._id === selectedPortfolioId);
  const selectedBalance = selectedPortfolioObj ? selectedPortfolioObj.balance : 0;
  const selectedFondoDisponible = selectedPortfolioObj ? selectedPortfolioObj.fondoDisponible : 0;

  // Callback para refrescar gráficos tras operar
  const handleTradeOrOrder = () => setRefresh((r) => r + 1);

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
        <strong>Balance total:</strong> ${totalBalance.toFixed(2)}
      </div>
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
          <strong>Fondo disponible del portafolio seleccionado:</strong> ${selectedFondoDisponible?.toFixed(2) ?? "0.00"}
        </div>
      )}
      <PortfolioBalancePie refresh={refresh} />      {loading ? (
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
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(portfolios) ? portfolios : []).length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-4">No tienes portafolios aún.</td>
              </tr>
            ) : (
              (Array.isArray(portfolios) ? portfolios : []).map((p) => (
                <tr key={p._id}>
                  <td className="py-2 px-4 border-b">{p.name}</td>
                  <td className="py-2 px-4 border-b">${p.balance?.toFixed(2) ?? "0.00"}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Portfolios;

/* No cambies nada aquí, solo asegúrate de que el selector de portafolio y la lógica
   de selección estén solo en este archivo y no en el layout. */
