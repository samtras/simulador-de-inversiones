// -----------------------------------------------------------------------------
// Archivo: CandlestickChart.jsx
// Descripción: Componente para visualizar gráficos de velas (candlestick) de un activo.
// Utiliza ApexCharts para mostrar el historial de precios y permite analizar tendencias.
// -----------------------------------------------------------------------------

import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import axios from "axios";

/**
 * Componente CandlestickChart
 * Visualiza el gráfico de velas (candlestick), línea o área de un activo financiero.
 * Permite seleccionar el tipo de gráfico y el intervalo de tiempo.
 * @param {string} assetName - Nombre del activo a mostrar en el gráfico
 * @param {string} symbol - Símbolo del activo para consultar datos históricos
 */
const CandlestickChart = ({ assetName, symbol }) => {
  // Estado para el tipo de gráfico (candlestick, línea, área)
  const [chartType, setChartType] = useState("candlestick");
  // Estado para los datos históricos del gráfico
  const [chartData, setChartData] = useState([]);
  // Estado de carga
  const [loading, setLoading] = useState(true);
  // Estado de error
  const [error, setError] = useState(null);
  // Estado para el intervalo de tiempo (número de días)
  const [interval, setInterval] = useState("100");

  /**
   * useEffect para cargar los datos históricos del activo al montar el componente o cambiar el símbolo/intervalo.
   * Llama a la API para obtener los datos históricos y los almacena en el estado.
   */
  useEffect(() => {
    /**
     * fetchHistoricalData
     * Función asíncrona que obtiene los datos históricos del activo desde la API.
     * - Maneja estados de carga y error.
     */
    const fetchHistoricalData = async () => {
      try {
        setLoading(true);
        // Detecta si es cripto o forex por el símbolo
        const isCrypto = /USD$/.test(symbol) && symbol.length > 6;
        const isForex = [
          "USDCAD", "EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCHF", "NZDUSD", "USDCNY", "USDMXN", "USDINR"
        ].includes(symbol);
        let url;
        if (isCrypto) {
          url = `${import.meta.env.VITE_API_URL}/market-data/historical-crypto/${symbol}?interval=${interval}`;
        } else if (isForex) {
          url = `${import.meta.env.VITE_API_URL}/market-data/historical-forex/${symbol}?interval=${interval}`;
        } else {
          url = `${import.meta.env.VITE_API_URL}/market-data/historical/${symbol}?interval=${interval}`;
        }
        const response = await axios.get(url);
        setChartData(response.data);
      } catch {
        setError("Error al cargar los datos históricos.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [symbol, interval]);

  // Opciones de configuración para ApexCharts
  const chartOptions = {
    chart: { id: "dynamic-chart", type: chartType },
    xaxis: { type: "datetime" },
  };

  // Renderiza mensajes de carga o error si corresponde
  if (loading) return <div className="p-4">Cargando datos...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  // Renderiza el selector de tipo de gráfico, intervalo y el gráfico en sí
  return (
    <div className="p-4">
      <div className="mb-4">
        <label htmlFor="chartType" className="block text-gray-700 mb-2">
          Tipo de Gráfico:
        </label>
        <select
          id="chartType"
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          className="p-2 border rounded-md bg-gray-50 text-gray-800"
        >
          <option value="candlestick">Velas</option>
          <option value="line">Línea</option>
          <option value="area">Área</option>
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="interval" className="block text-gray-700 mb-2">
          Intervalo de Tiempo:
        </label>
        <select
          id="interval"
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
          className="p-2 border rounded-md bg-gray-50 text-gray-800"
        >
          <option value="7">Últimos 7 días</option>
          <option value="30">Últimos 30 días</option>
          <option value="60">Últimos 2 meses</option>
          <option value="90">Últimos 3 meses</option>
          <option value="180">Últimos 6 meses</option>
          <option value="365">Último año</option>
          <option value="1825">Últimos 5 años</option>
          <option value="max">Máximo histórico</option>
        </select>
      </div>
      <Chart
        options={chartOptions}
        series={[{ name: assetName, data: chartData }]}
        type={chartType}
        height="400"
      />
    </div>
  );
};

export default CandlestickChart;
