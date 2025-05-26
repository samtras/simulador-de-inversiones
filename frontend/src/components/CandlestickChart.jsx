// -----------------------------------------------------------------------------
// Archivo: CandlestickChart.jsx
// Descripción: Componente para visualizar gráficos de velas (candlestick) de un activo.
// Utiliza ApexCharts para mostrar el historial de precios y permite analizar tendencias.
// -----------------------------------------------------------------------------

import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import { SMA, EMA, BollingerBands } from "technicalindicators";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, '');

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
  const [indicator, setIndicator] = useState(""); // SMA, EMA, BollingerBands o ""
  const [indicatorPeriod, setIndicatorPeriod] = useState(""); // 5, 10, 20, 30

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
          url = `${API_URL}/market-data/historical-crypto/${symbol}?interval=${interval}`;
        } else if (isForex) {
          url = `${API_URL}/market-data/historical-forex/${symbol}?interval=${interval}`;
        } else {
          url = `${API_URL}/market-data/historical/${symbol}?interval=${interval}`;
        }
        const response = await axios.get(url);
        console.log("Datos históricos recibidos:", response.data);
        setChartData(response.data);
      } catch {
        setError("Error al cargar los datos históricos.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [symbol, interval]);

  // Calcular datos del indicador seleccionado
  let indicatorData = [];
  if (indicator && indicatorPeriod && chartData && chartData.length > Number(indicatorPeriod)) {
    const closes = chartData.map((d) => d.y ? d.y[3] : d.close || d.c);
    if (indicator === "SMA") {
      const values = SMA.calculate({ period: Number(indicatorPeriod), values: closes });
      indicatorData = chartData.slice(Number(indicatorPeriod) - 1).map((d, i) => ({ x: d.x || d.date || d.time, y: values[i] }));
    } else if (indicator === "EMA") {
      const values = EMA.calculate({ period: Number(indicatorPeriod), values: closes });
      indicatorData = chartData.slice(Number(indicatorPeriod) - 1).map((d, i) => ({ x: d.x || d.date || d.time, y: values[i] }));
    } else if (indicator === "BollingerBands") {
      const bands = BollingerBands.calculate({ period: Number(indicatorPeriod), values: closes, stdDev: 2 });
      indicatorData = chartData.slice(Number(indicatorPeriod) - 1).map((d, i) => ({
        x: d.x || d.date || d.time,
        y: bands[i] ? bands[i].middle : null,
        upper: bands[i] ? bands[i].upper : null,
        lower: bands[i] ? bands[i].lower : null,
      }));
    }
  }

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
      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <label htmlFor="chartType" className="block text-gray-700 mb-1">
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
        <div>
          <label htmlFor="interval" className="block text-gray-700 mb-1">
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
        <div>
          <label htmlFor="indicator" className="block text-gray-700 mb-1">
            Indicador técnico:
          </label>
          <select
            id="indicator"
            value={indicator}
            onChange={(e) => setIndicator(e.target.value)}
            className="p-2 border rounded-md bg-gray-50 text-gray-800"
          >
            <option value="">Ninguno</option>
            <option value="SMA">SMA</option>
            <option value="EMA">EMA</option>
            <option value="BollingerBands">Bandas de Bollinger</option>
          </select>
        </div>
        {(indicator === "SMA" || indicator === "EMA" || indicator === "BollingerBands") && (
          <div>
            <label htmlFor="indicatorPeriod" className="block text-gray-700 mb-1">
              Periodo:
            </label>
            <select
              id="indicatorPeriod"
              value={indicatorPeriod}
              onChange={(e) => setIndicatorPeriod(e.target.value)}
              className="p-2 border rounded-md bg-gray-50 text-gray-800"
            >
              <option value="">Selecciona</option>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
            </select>
          </div>
        )}
      </div>
      <Chart
        options={chartOptions}
        series={[
          { name: assetName, data: chartData },
          ...(indicatorData.length > 0 && (chartType === "line" || chartType === "area" || chartType === "candlestick") && indicator !== "BollingerBands"
            ? [{ name: `${indicator} ${indicatorPeriod}`, type: "line", data: indicatorData }]
            : []),
          ...(indicator === "BollingerBands" && indicatorData.length > 0 && (chartType === "line" || chartType === "area" || chartType === "candlestick")
            ? [
                { name: `BB Middle ${indicatorPeriod}`, type: "line", data: indicatorData.map(d => ({ x: d.x, y: d.y })) },
                { name: `BB Upper ${indicatorPeriod}`, type: "line", data: indicatorData.map(d => ({ x: d.x, y: d.upper })) },
                { name: `BB Lower ${indicatorPeriod}`, type: "line", data: indicatorData.map(d => ({ x: d.x, y: d.lower })) },
              ]
            : []),
        ]}
        type={chartType}
        height="400"
      />
    </div>
  );
};

export default CandlestickChart;
