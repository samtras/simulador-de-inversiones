import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, '');

const CRYPTO_SYMBOLS = [
  "BTCUSD", "ETHUSD", "USDTUSD", "BNBUSD", "SOLUSD", "USDCUSD", "XRPUSD", "DOGEUSD", "TONUSD", "TRXUSD", "ADAUSD", "AVAXUSD", "SHIBUSD", "LINKUSD", "DOTUSD", "BCHUSD", "DAIUSD", "LEOUSD", "LTCUSD", "NEARUSD", "KASUSD", "UNIUSD", "ICPUSD", "FETUSD", "XMRUSD", "PEPEUSD", "SUIUSD", "APTUSD", "XLMUSD", "POLUSD", "FDUSD", "ETCUSD", "OKBUSD", "STXUSD", "TAOUSD", "CROUSD", "AAVEUSD", "FILUSD", "IMXUSD", "HBARUSD", "MNTUSD", "INJUSD", "ARBUSD", "VETUSD", "OPUSD", "ATOMUSD", "WIFUSD", "FTMUSD", "MKRUSD", "GRTUSD", "RUNEUSD", "THETAUSD", "BGBUSD", "ARUSD", "MATICUSD", "HNTUSD", "BONKUSD", "FLOKIUSD", "ALGOUSD", "SEIUSD", "PYTHUSD", "JUPUSD", "TIAUSD", "JASMYUSD", "KCSUSD", "BSVUSD", "OMUSD", "LDOUSD", "QNTUSD", "ONDOUSD", "BTTUSD", "FLOWUSD", "COREUSD", "PYUSD", "NOTUSD", "BRETTUSD", "USDDUSD", "GTUSD", "EOSUSD", "FLRUSD", "BEAMUSD", "CKBUSD", "POPCATUSD", "STRKUSD", "EGLDUSD", "AXSUSD", "NEOUSD", "ORDIUSD", "WLDUSD", "XTZUSD", "GALAUSD", "XECUSD", "CFXUSD", "AKTUSD", "SANDUSD", "DYDXUSD", "BNXUSD"
];

const CryptosTable = ({ onSelect }) => {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCryptos = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${API_URL}/market-data/cryptos`
        );
        setCryptos(response.data);
      } catch (err) {
        setError("Error al cargar los datos de criptomonedas.");
      } finally {
        setLoading(false);
      }
    };
    fetchCryptos();
  }, []);

  if (loading) return <div className="p-4">Cargando criptomonedas...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold mb-2">Criptomonedas</h2>
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
          {(Array.isArray(cryptos) ? cryptos : []).map((item) => (
            <tr key={item.symbol}>
              <td className="py-2 px-4 border-b">{item.symbol}</td>
              <td className="py-2 px-4 border-b">${item.price?.toFixed(2) ?? "-"}</td>
              <td className={`py-2 px-4 border-b ${item.change > 0 ? "text-green-500" : "text-red-500"}`}>
                {item.change?.toFixed(2) ?? "-"}
              </td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => onSelect(item)}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
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

export default CryptosTable;
