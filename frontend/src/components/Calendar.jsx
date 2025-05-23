// -----------------------------------------------------------------------------
// Archivo: Calendar.jsx
// Descripción: Componente que muestra el calendario económico con eventos relevantes
// para los mercados financieros. Permite visualizar fechas y detalles de eventos.
// -----------------------------------------------------------------------------

import { useEffect, useState } from "react";
import axios from "axios";

/**
 * Componente principal Calendar
 * - Obtiene y muestra eventos económicos (dividendos, ganancias, splits) de los próximos 30 días.
 * - Permite filtrar por tipo de evento y buscar por símbolo.
 */
const Calendar = () => {
  // Estado para todos los eventos unificados
  const [events, setEvents] = useState([]);
  // Estado para eventos filtrados según los filtros activos
  const [filteredEvents, setFilteredEvents] = useState([]);
  // Estado de carga y error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Estado de filtros (tipos de evento y búsqueda por símbolo)
  const [filters, setFilters] = useState({
    dividends: true,
    earnings: true,
    splits: true,
    search: "",
  });

  /**
   * useEffect principal: obtiene los eventos del calendario desde el backend/API.
   * Unifica dividendos, ganancias y splits en un solo arreglo y los ordena por fecha.
   */
  useEffect(() => {
    const fetchCalendarData = async () => {
      setLoading(true);
      setError(null);
      const today = new Date();
      const from = today.toISOString().split("T")[0];
      const to = new Date(today.setDate(today.getDate() + 30))
        .toISOString()
        .split("T")[0];
      try {
        // Llama a las 3 APIs en paralelo y maneja errores individuales
        const [dividends, earnings, splits] = await axios.all([
          axios.get(
            `${import.meta.env.VITE_API_URL}/market-data/dividends-calendar?from=${from}&to=${to}`
          ).catch(() => ({ data: [] })),
          axios.get(
            `${import.meta.env.VITE_API_URL}/market-data/earnings-calendar?from=${from}&to=${to}`
          ).catch(() => ({ data: [] })),
          axios.get(
            `${import.meta.env.VITE_API_URL}/market-data/splits-calendar?from=${from}&to=${to}`
          ).catch(() => ({ data: [] })),
        ]);
        // Unifica y normaliza los eventos
        const unifiedEvents = [
          ...dividends.data.map((item) => ({
            date: item.date,
            symbol: item.symbol,
            type: "Dividendos",
            details: {
              dividend: item.dividend,
              yield: item.yield,
              frequency: item.frequency,
            },
          })),
          ...earnings.data.map((item) => ({
            date: item.date,
            symbol: item.symbol,
            type: "Ganancias",
            details: {
              epsActual: item.epsActual,
              epsEstimated: item.epsEstimated,
              revenueActual: item.revenueActual,
              revenueEstimated: item.revenueEstimated,
            },
          })),
          ...splits.data.map((item) => ({
            date: item.date,
            symbol: item.symbol,
            type: "Splits",
            details: {
              numerator: item.numerator,
              denominator: item.denominator,
            },
          })),
        ];
        unifiedEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(unifiedEvents);
        setFilteredEvents(unifiedEvents);
      } catch (err) {
        setError("Error al cargar los datos del calendario.");
      } finally {
        setLoading(false);
      }
    };
    fetchCalendarData();
  }, []);

  /**
   * handleFilterChange: actualiza los filtros de tipo de evento y búsqueda.
   * Permite filtrar por dividendos, ganancias, splits y buscar por símbolo.
   */
  const handleFilterChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /**
   * useEffect: filtra los eventos según los filtros activos y la búsqueda.
   */
  useEffect(() => {
    const { dividends, earnings, splits, search } = filters;
    const filtered = events.filter((event) => {
      const matchesType =
        (dividends && event.type === "Dividendos") ||
        (earnings && event.type === "Ganancias") ||
        (splits && event.type === "Splits");
      const matchesSearch = event.symbol
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesType && matchesSearch;
    });
    setFilteredEvents(filtered);
  }, [filters, events]);

  // Renderizado condicional según estado de carga, error o eventos
  if (loading) return <div className="p-4">Cargando calendario...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (filteredEvents.length === 0)
    return <div className="p-4">No hay eventos disponibles.</div>;

  // Render principal: tabla de eventos y filtros
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Calendario Económico</h2>
      <div className="flex space-x-4 mb-4">
        <div>
          <label className="block text-sm font-medium">Buscar por símbolo</label>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            className="p-2 border rounded-md bg-gray-50"
            placeholder="Ej: AAPL"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Filtrar por tipo</label>
          <div className="flex items-center space-x-2">
            <label>
              <input
                type="checkbox"
                name="dividends"
                checked={filters.dividends}
                onChange={handleFilterChange}
                className="mr-1"
              />
              Dividendos
            </label>
            <label>
              <input
                type="checkbox"
                name="earnings"
                checked={filters.earnings}
                onChange={handleFilterChange}
                className="mr-1"
              />
              Ganancias
            </label>
            <label>
              <input
                type="checkbox"
                name="splits"
                checked={filters.splits}
                onChange={handleFilterChange}
                className="mr-1"
              />
              Splits
            </label>
          </div>
        </div>
      </div>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Fecha</th>
            <th className="py-2 px-4 border-b">Símbolo</th>
            <th className="py-2 px-4 border-b">Tipo</th>
            <th className="py-2 px-4 border-b">Detalles</th>
          </tr>
        </thead>
        <tbody>
          {filteredEvents.map((event, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border-b">
                {new Date(event.date).toLocaleDateString()}
              </td>
              <td className="py-2 px-4 border-b">{event.symbol}</td>
              <td className="py-2 px-4 border-b">{event.type}</td>
              <td className="py-2 px-4 border-b">
                {event.type === "Dividendos" && (
                  <div>
                    <p>Dividendo: ${event.details.dividend}</p>
                    <p>Rendimiento: {event.details.yield}%</p>
                    <p>Frecuencia: {event.details.frequency}</p>
                  </div>
                )}
                {event.type === "Ganancias" && (
                  <div>
                    <p>EPS Actual: {event.details.epsActual}</p>
                    <p>EPS Estimado: {event.details.epsEstimated}</p>
                    <p>Ingresos Actuales: ${event.details.revenueActual}</p>
                    <p>Ingresos Estimados: ${event.details.revenueEstimated}</p>
                  </div>
                )}
                {event.type === "Splits" && (
                  <div>
                    <p>
                      Split: {event.details.numerator} /{" "}
                      {event.details.denominator}
                    </p>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Calendar;
