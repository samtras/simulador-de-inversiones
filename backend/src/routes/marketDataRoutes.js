// -----------------------------------------------------------------------------
// Archivo: marketDataRoutes.js
// Descripción: Rutas de la API para la obtención de datos de mercado, históricos,
// noticias, calendario económico, dividendos, splits y automatización de cierre
// de órdenes. Utiliza caché para optimizar el rendimiento y reducir llamadas a
// APIs externas.
// -----------------------------------------------------------------------------

const express = require('express');
const axios = require('axios');
const { getCache, setCache } = require('../utils/cache');
const Order = require('../models/Order'); // Importar modelo de órdenes
require('dotenv').config();

const router = express.Router();
const API_KEY = process.env.FMP_API_KEY;

// Ruta para obtener cotizaciones actuales
router.get('/', async (req, res) => {
  const cacheKey = 'current_market_data';
  const cachedData = getCache(cacheKey);

  if (cachedData) {
    return res.json(cachedData); // Retornar datos desde la caché si están disponibles
  }

  try {
    const symbols = [
      "AAPL", "TSLA", "AMZN", "MSFT", "NVDA", "GOOGL", "META", "NFLX", "JPM", "V", "BAC", "AMD", "PYPL", "DIS", "T", "PFE",
      "COST", "INTC", "KO", "TGT", "NKE", "SPY", "BA", "BABA", "XOM", "WMT", "GE", "CSCO", "VZ", "JNJ", "CVX", "PLTR", "SQ",
      "SHOP", "SBUX", "SOFI", "HOOD", "RBLX", "SNAP", "UBER", "FDX", "ABBV", "ETSY", "MRNA", "LMT", "GM", "F", "RIVN", "LCID",
      "CCL", "DAL", "UAL", "AAL", "TSM", "SONY", "ET", "NOK", "MRO", "COIN", "SIRI", "RIOT", "CPRX", "VWO", "SPYG", "ROKU",
      "VIAC", "ATVI", "BIDU", "DOCU", "ZM", "PINS", "TLRY", "WBA", "MGM", "NIO", "C", "GS", "WFC", "ADBE", "PEP", "UNH",
      "CARR", "FUBO", "HCA", "TWTR", "BILI", "RKT"
    ];

    const response = await axios.get(
      `https://financialmodelingprep.com/api/v3/quote/${symbols.join(",")}?apikey=${API_KEY}`
    );

    if (!response.data || response.data.length === 0) {
      return res.status(404).json({ message: 'No se encontraron datos de mercado.' });
    }

    setCache(cacheKey, response.data, 10 * 60 * 1000); // Almacenar en caché por 10 minutos
    res.json(response.data);
  } catch (error) {
    console.error('Error obteniendo datos de mercado:', error.response ? error.response.data : error.message);
    res.status(500).json({
      message: 'Error obteniendo datos de mercado',
      error: error.response ? error.response.data : error.message,
    });
  }
});

/**
 * Ruta para obtener datos históricos de un activo
 * Devuelve los datos de precios históricos para un símbolo y un intervalo de días.
 * Usa caché para optimizar llamadas repetidas.
 */
router.get('/historical/:symbol', async (req, res) => {
  const { symbol } = req.params;
  let interval = req.query.interval || '100'; // Puede ser 'max' o un número
  const cacheKey = `historical_${symbol}_${interval}`;
  const cachedData = getCache(cacheKey);

  if (cachedData) {
    console.log(`Cache hit for ${cacheKey}`); // Log para depuración
    return res.json(cachedData); // Retornar datos desde la caché si están disponibles
  }

  try {
    const response = await axios.get(
      `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?apikey=${API_KEY}`
    );

    if (!response.data.historical) {
      return res.status(404).json({ message: 'Datos históricos no encontrados para el símbolo proporcionado.' });
    }

    let formattedData = response.data.historical.map((entry) => ({
      x: new Date(entry.date),
      y: [entry.open, entry.high, entry.low, entry.close],
    }));

    if (interval !== 'max') {
      const days = parseInt(interval, 10);
      formattedData = formattedData.slice(0, days);
    }

    setCache(cacheKey, formattedData, 60 * 60 * 1000); // Almacenar en caché por 60 minutos
    console.log(`Cache set for ${cacheKey}`); // Log para depuración
    res.json(formattedData);
  } catch (error) {
    console.error('Error obteniendo datos históricos:', error.response ? error.response.data : error.message);
    res.status(500).json({
      message: 'Error obteniendo datos históricos',
      error: error.response ? error.response.data : error.message,
    });
  }
});

/**
 * Ruta para obtener noticias financieras
 * Devuelve una lista de noticias relevantes usando caché y API externa.
 */
router.get('/news', async (req, res) => {
  const cacheKey = 'financial_news';
  const cachedData = getCache(cacheKey);

  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const response = await axios.get(
      `https://financialmodelingprep.com/stable/fmp-articles?page=0&limit=20&apikey=${API_KEY}`
    );

    if (!response.data || response.data.length === 0) {
      return res.status(404).json({ message: 'No se encontraron noticias financieras.' });
    }

    setCache(cacheKey, response.data, 10 * 60 * 1000); // Almacenar en caché por 10 minutos
    res.json(response.data);
  } catch (error) {
    console.error('Error obteniendo noticias financieras:', error.message);
    res.status(500).json({
      message: 'Error obteniendo noticias financieras.',
      error: error.response ? error.response.data : error.message,
    });
  }
});

/**
 * Ruta para obtener el calendario económico
 * Devuelve eventos económicos relevantes (simulados o desde API externa).
 */
router.get('/calendar', async (req, res) => {
  const cacheKey = 'economic_calendar';
  const cachedData = getCache(cacheKey);

  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    // Simular datos si el endpoint no está disponible
    const simulatedData = [
      {
        date: "2024-04-15",
        country: "USA",
        event: "Inflación - IPC",
        impact: "High",
        previous: "5.0%",
        estimate: "4.8%",
        actual: "4.9%",
      },
      {
        date: "2024-04-16",
        country: "Germany",
        event: "Tasa de Desempleo",
        impact: "Medium",
        previous: "3.5%",
        estimate: "3.4%",
        actual: "3.4%",
      },
      {
        date: "2024-04-17",
        country: "Japan",
        event: "PIB Trimestral",
        impact: "Low",
        previous: "0.9%",
        estimate: "1.0%",
        actual: "1.1%",
      },
    ];

    setCache(cacheKey, simulatedData, 10 * 60 * 1000); // Almacenar en caché por 10 minutos
    res.json(simulatedData);
  } catch (error) {
    console.error('Error obteniendo el calendario económico:', error.response?.data || error.message);
    res.status(500).json({
      message: 'Error obteniendo el calendario económico.',
      error: error.response?.data || error.message,
    });
  }
});

/**
 * Ruta para obtener el calendario de dividendos
 * Devuelve los próximos dividendos para un rango de fechas.
 */
router.get('/dividends-calendar', async (req, res) => {
  const { from, to } = req.query;
  const cacheKey = `dividends_calendar_${from}_${to}`;
  const cachedData = getCache(cacheKey);

  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const response = await axios.get(
      `https://financialmodelingprep.com/stable/dividends-calendar?from=${from}&to=${to}&apikey=${API_KEY}`
    );

    setCache(cacheKey, response.data, 10 * 60 * 1000); // Cache por 10 minutos
    res.json(response.data);
  } catch (error) {
    console.error('Error obteniendo el calendario de dividendos:', error.message);
    res.status(500).json({ message: 'Error obteniendo el calendario de dividendos.' });
  }
});

/**
 * Ruta para obtener el calendario de ganancias
 * Devuelve los próximos reportes de ganancias para un rango de fechas.
 */
router.get('/earnings-calendar', async (req, res) => {
  const { from, to } = req.query;
  const cacheKey = `earnings_calendar_${from}_${to}`;
  const cachedData = getCache(cacheKey);

  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const response = await axios.get(
      `https://financialmodelingprep.com/stable/earnings-calendar?from=${from}&to=${to}&apikey=${API_KEY}`
    );

    setCache(cacheKey, response.data, 10 * 60 * 1000); // Cache por 10 minutos
    res.json(response.data);
  } catch (error) {
    console.error('Error obteniendo el calendario de ganancias:', error.message);
    res.status(500).json({ message: 'Error obteniendo el calendario de ganancias.' });
  }
});

/**
 * Ruta para obtener el calendario de splits
 * Devuelve los próximos splits de acciones para un rango de fechas.
 */
router.get('/splits-calendar', async (req, res) => {
  const { from, to } = req.query;
  const cacheKey = `splits_calendar_${from}_${to}`;
  const cachedData = getCache(cacheKey);

  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const response = await axios.get(
      `https://financialmodelingprep.com/stable/splits-calendar?from=${from}&to=${to}&apikey=${API_KEY}`
    );

    setCache(cacheKey, response.data, 10 * 60 * 1000); // Cache por 10 minutos
    res.json(response.data);
  } catch (error) {
    console.error('Error obteniendo el calendario de splits:', error.message);
    res.status(500).json({ message: 'Error obteniendo el calendario de splits.' });
  }
});

// Endpoint para obtener datos de commodities permitidos
router.get('/commodities', async (req, res) => {
  console.log('Solicitando commodities...');
  const symbols = ["BZUSD", "SIUSD", "ESUSD", "GCUSD"];
  const cacheKey = `commodities_${symbols.join('_')}`;
  const cachedData = getCache(cacheKey);
  if (cachedData) {
    console.log('Commodities desde caché');
    return res.json(cachedData);
  }
  try {
    const url = `https://financialmodelingprep.com/api/v3/quote/${symbols.join(",")}?apikey=${API_KEY}`;
    console.log('URL solicitada a FMP:', url);
    const response = await axios.get(url);
    console.log('Respuesta FMP:', response.data);
    if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
      // Devuelve el error real de FMP si existe
      return res.status(404).json({
        message: 'No se encontraron datos de commodities.',
        fmpResponse: response.data
      });
    }
    setCache(cacheKey, response.data, 10 * 60 * 1000); // 10 minutos
    res.json(response.data);
  } catch (error) {
    console.error('Error en endpoint commodities:', error, error?.response?.data);
    res.status(500).json({
      message: 'Error obteniendo datos de commodities',
      error: error.response ? error.response.data : error.message,
      url: `https://financialmodelingprep.com/api/v3/quote/${symbols.join(",")}?apikey=${API_KEY}`,
      apiKey: API_KEY ? 'PRESENTE' : 'FALTA'
    });
  }
});

// Endpoint para obtener datos de criptomonedas principales
router.get('/cryptos', async (req, res) => {
  const symbols = [
    "BTCUSD", "ETHUSD", "USDTUSD", "BNBUSD", "SOLUSD", "USDCUSD", "XRPUSD", "DOGEUSD", "TONUSD", "TRXUSD", "ADAUSD", "AVAXUSD", "SHIBUSD", "LINKUSD", "DOTUSD", "BCHUSD", "DAIUSD", "LEOUSD", "LTCUSD", "NEARUSD", "KASUSD", "UNIUSD", "ICPUSD", "FETUSD", "XMRUSD", "PEPEUSD", "SUIUSD", "APTUSD", "XLMUSD", "POLUSD", "FDUSD", "ETCUSD", "OKBUSD", "STXUSD", "TAOUSD", "CROUSD", "AAVEUSD", "FILUSD", "IMXUSD", "HBARUSD", "MNTUSD", "INJUSD", "ARBUSD", "VETUSD", "OPUSD", "ATOMUSD", "WIFUSD", "FTMUSD", "MKRUSD", "GRTUSD", "RUNEUSD", "THETAUSD", "BGBUSD", "ARUSD", "MATICUSD", "HNTUSD", "BONKUSD", "FLOKIUSD", "ALGOUSD", "SEIUSD", "PYTHUSD", "JUPUSD", "TIAUSD", "JASMYUSD", "KCSUSD", "BSVUSD", "OMUSD", "LDOUSD", "QNTUSD", "ONDOUSD", "BTTUSD", "FLOWUSD", "COREUSD", "PYUSD", "NOTUSD", "BRETTUSD", "USDDUSD", "GTUSD", "EOSUSD", "FLRUSD", "BEAMUSD", "CKBUSD", "POPCATUSD", "STRKUSD", "EGLDUSD", "AXSUSD", "NEOUSD", "ORDIUSD", "WLDUSD", "XTZUSD", "GALAUSD", "XECUSD", "CFXUSD", "AKTUSD", "SANDUSD", "DYDXUSD", "BNXUSD"
  ];
  const cacheKey = `cryptos_${symbols.join('_')}`;
  const cachedData = getCache(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }
  try {
    const url = `https://financialmodelingprep.com/api/v3/quote/${symbols.join(",")}?apikey=${API_KEY}`;
    const response = await axios.get(url);
    if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
      return res.status(404).json({ message: 'No se encontraron datos de criptomonedas.', fmpResponse: response.data });
    }
    setCache(cacheKey, response.data, 10 * 60 * 1000);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      message: 'Error obteniendo datos de criptomonedas',
      error: error.response ? error.response.data : error.message,
      url: `https://financialmodelingprep.com/api/v3/quote/${symbols.join(",")}?apikey=${API_KEY}`,
      apiKey: API_KEY ? 'PRESENTE' : 'FALTA'
    });
  }
});

// Endpoint para obtener histórico de una cripto
router.get('/historical-crypto/:symbol', async (req, res) => {
  const { symbol } = req.params;
  let interval = req.query.interval || '100';
  const cacheKey = `historical_crypto_${symbol}_${interval}`;
  const cachedData = getCache(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }
  try {
    const url = `https://financialmodelingprep.com/stable/historical-price-eod/light?symbol=${symbol}&apikey=${API_KEY}`;
    const response = await axios.get(url);
    let data = response.data?.historical || [];
    if (interval !== 'max') {
      const days = parseInt(interval, 10);
      data = data.slice(0, days);
    }
    // Formato para ApexCharts
    const formattedData = data.map((entry) => ({
      x: new Date(entry.date),
      y: [entry.open, entry.high, entry.low, entry.close],
    }));
    setCache(cacheKey, formattedData, 60 * 60 * 1000);
    res.json(formattedData);
  } catch (error) {
    res.status(500).json({
      message: 'Error obteniendo histórico de cripto',
      error: error.response ? error.response.data : error.message,
      url: `https://financialmodelingprep.com/stable/historical-price-eod/light?symbol=${symbol}&apikey=${API_KEY}`,
      apiKey: API_KEY ? 'PRESENTE' : 'FALTA'
    });
  }
});

// Endpoint para obtener datos de forex principales
router.get('/forex', async (req, res) => {
  const symbols = [
    "USDCAD", "EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCHF", "NZDUSD", "USDCNY", "USDMXN", "USDINR"
  ];
  const cacheKey = `forex_${symbols.join('_')}`;
  const cachedData = getCache(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }
  try {
    // Consulta cada símbolo individualmente (por limitación de plan gratuito)
    const results = [];
    for (const symbol of symbols) {
      const url = `https://financialmodelingprep.com/stable/quote?symbol=${symbol}&apikey=${API_KEY}`;
      const response = await axios.get(url);
      if (Array.isArray(response.data) && response.data.length > 0) {
        results.push(response.data[0]);
      }
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'No se encontraron datos de forex.' });
    }
    setCache(cacheKey, results, 10 * 60 * 1000);
    res.json(results);
  } catch (error) {
    console.error('Error en endpoint FOREX:', error, error?.response?.data);
    res.status(500).json({
      message: 'Error obteniendo datos de forex',
      error: error.response ? error.response.data : error.message
    });
  }
});

// Endpoint para obtener histórico de un par forex
router.get('/historical-forex/:symbol', async (req, res) => {
  const { symbol } = req.params;
  let interval = req.query.interval || '100';
  const cacheKey = `historical_forex_${symbol}_${interval}`;
  const cachedData = getCache(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }
  try {
    const url = `https://financialmodelingprep.com/stable/historical-price-eod/light?symbol=${symbol}&apikey=${API_KEY}`;
    const response = await axios.get(url);
    let data = response.data?.historical || [];
    if (interval !== 'max') {
      const days = parseInt(interval, 10);
      data = data.slice(0, days);
    }
    const formattedData = data.map((entry) => ({
      x: new Date(entry.date),
      y: [entry.open, entry.high, entry.low, entry.close],
    }));
    setCache(cacheKey, formattedData, 60 * 60 * 1000);
    res.json(formattedData);
  } catch (error) {
    res.status(500).json({
      message: 'Error obteniendo histórico de forex',
      error: error.response ? error.response.data : error.message,
      url: `https://financialmodelingprep.com/stable/historical-price-eod/light?symbol=${symbol}&apikey=${API_KEY}`,
      apiKey: API_KEY ? 'PRESENTE' : 'FALTA'
    });
  }
});

/**
 * Proceso automatizado para actualizar precios y manejar stopLoss/takeProfit
 * Cada 30 minutos consulta precios y llama al endpoint de auto-cierre de órdenes.
 */
if (process.env.NODE_ENV !== 'test') {
  setInterval(async () => {
    try {
      const symbols = [
        "AAPL", "TSLA", "AMZN", "MSFT", "NVDA", "GOOGL", "META", "NFLX", "JPM", "V", "BAC", "AMD", "PYPL", "DIS", "T", "PFE",
        "COST", "INTC", "KO", "TGT", "NKE", "SPY", "BA", "BABA", "XOM", "WMT", "GE", "CSCO", "VZ", "JNJ", "CVX", "PLTR", "SQ",
        "SHOP", "SBUX", "SOFI", "HOOD", "RBLX", "SNAP", "UBER", "FDX", "ABBV", "ETSY", "MRNA", "LMT", "GM", "F", "RIVN", "LCID",
        "CCL", "DAL", "UAL", "AAL", "TSM", "SONY", "ET", "NOK", "MRO", "COIN", "SIRI", "RIOT", "CPRX", "VWO", "SPYG", "ROKU",
        "VIAC", "ATVI", "BIDU", "DOCU", "ZM", "PINS", "TLRY", "WBA", "MGM", "NIO", "C", "GS", "WFC", "ADBE", "PEP", "UNH",
        "CARR", "FUBO", "HCA", "TWTR", "BILI", "RKT"
      ];
      const response = await axios.get(
        `https://financialmodelingprep.com/api/v3/quote/${symbols.join(",")}?apikey=${API_KEY}`
      );
      setCache('current_market_data', response.data, 10 * 60 * 1000);
    } catch (error) {
      console.error('Error en actualización automática de mercado:', error.message);
    }
  }, 30 * 60 * 1000);
}

module.exports = router;