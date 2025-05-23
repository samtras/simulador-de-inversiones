// -----------------------------------------------------------------------------
// Archivo: TradingWindow.jsx
// Descripción: Componente para ejecutar operaciones de compra/venta de activos.
// Permite configurar cantidad, tipo de operación, stop loss y take profit, y
// muestra un resumen de la operación antes de ejecutarla.
// -----------------------------------------------------------------------------

import { useState, useContext, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.BACKEND_API_URL || "http://localhost:5000/api";

import { AuthContext } from "../context/AuthContext";
import { usePortfolio } from "../context/PortfolioContext";

/**
 * TradingWindow
 * Componente para crear y ejecutar operaciones de compra o venta (short) de activos.
 * Props:
 *   - selectedAsset: objeto con info del activo seleccionado (incluye precio actual)
 *   - availableBalance: saldo disponible del usuario
 *   - onExecuteTrade: callback para actualizar el saldo tras operar
 */
const TradingWindow = ({ selectedAsset, availableBalance, onTradeExecuted }) => {
  const { user } = useContext(AuthContext);
  const { selectedPortfolioId, setAvailableBalance } = usePortfolio();
  const [operationType, setOperationType] = useState("buy");
  const [quantity, setQuantity] = useState(1);
  const [takeProfit, setTakeProfit] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [totalCost, setTotalCost] = useState(0);
  const [potentialProfit, setPotentialProfit] = useState(null);
  const [potentialLoss, setPotentialLoss] = useState(null);

  const currentPrice = selectedAsset?.price || 0;

  /**
   * useEffect: Calcula el costo/ingreso inicial y la ganancia/pérdida potencial
   * según el tipo de operación (compra o venta), el precio actual y los stops.
   */
  useEffect(() => {
    const cost = currentPrice * quantity;
    setTotalCost(cost);

    if (operationType === "buy") {
      // Lógica para compra
      if (takeProfit) {
        setPotentialProfit((takeProfit - currentPrice) * quantity);
      } else {
        setPotentialProfit(null);
      }
      if (stopLoss) {
        setPotentialLoss((stopLoss - currentPrice) * quantity);
      } else {
        setPotentialLoss(null);
      }
    } else {
      // Lógica para venta (short)
      if (takeProfit) {
        setPotentialProfit((currentPrice - takeProfit) * quantity);
      } else {
        setPotentialProfit(null);
      }
      if (stopLoss) {
        setPotentialLoss((currentPrice - stopLoss) * quantity);
      } else {
        setPotentialLoss(null);
      }
    }
  }, [quantity, currentPrice, takeProfit, stopLoss, operationType]);

  // Validaciones de precios para compra/venta
  let priceError = "";
  if (operationType === "buy") {
    if (takeProfit && Number(takeProfit) <= currentPrice) {
      priceError = "El precio objetivo debe ser mayor al precio actual en una compra.";
    }
    if (stopLoss && Number(stopLoss) >= currentPrice) {
      priceError = "El Stop Loss debe ser menor al precio actual en una compra.";
    }
  } else {
    if (takeProfit && Number(takeProfit) >= currentPrice) {
      priceError = "El precio objetivo debe ser menor al precio actual en una venta.";
    }
    if (stopLoss && Number(stopLoss) <= currentPrice) {
      priceError = "El Stop Loss debe ser mayor al precio actual en una venta.";
    }
  }

  // Determina si el botón de ejecutar debe estar deshabilitado
  const isExecuteDisabled =
    !quantity ||
    quantity <= 0 ||
    totalCost > availableBalance ||
    !!priceError;

  /**
   * handleExecute
   * Envía la orden al backend para crear una operación de compra o venta.
   * Valida los campos, construye el payload y actualiza el saldo si es exitoso.
   */
  const handleExecute = async () => {
    try {
      if (!user?.id || !selectedAsset?.symbol || !quantity || quantity <= 0 || !selectedPortfolioId) {
        alert("Por favor completa todos los campos correctamente.");
        return;
      }

      // Asegura que los campos requeridos estén presentes y sean numéricos
      const payload = {
        userId: user.id,
        portfolioId: selectedPortfolioId, // <-- Asegúrate de que esto se envía
        symbol: selectedAsset.symbol,
        tipoOperacion: operationType === "buy" ? "Compra" : "Venta",
        cantidad: Number(quantity),
        precioEntrada: Number(currentPrice),
        stopLoss: stopLoss !== "" ? Number(stopLoss) : null,
        takeProfit: takeProfit !== "" ? Number(takeProfit) : null,
      };

      // Validación extra para stopLoss y takeProfit (el backend los requiere)
      if (payload.stopLoss === null || payload.takeProfit === null) {
        alert("Debes ingresar valores para Stop Loss y Take Profit.");
        return;
      }

      console.log("Datos enviados al backend:", payload); // Registrar los datos enviados

      // Envía la orden al backend
      const response = await axios.post(`${API_URL}/orders`, payload);

      if (response.status === 201) {
        // Actualiza el saldo global inmediatamente
        if (typeof setAvailableBalance === 'function' && typeof response.data.updatedBalance === 'number') {
          setAvailableBalance(response.data.updatedBalance);
        }
        // Llama al callback de refresco si existe
        if (typeof onTradeExecuted === 'function') {
          onTradeExecuted();
        }
        alert("Operación ejecutada exitosamente");
      }
    } catch (error) {
      console.error("Error ejecutando la operación:", error.message);
      // Mostrar el mensaje de error del backend si existe
      alert(`Error al ejecutar la operación: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <div className="w-[350px] shadow-md rounded-lg p-4 border text-sm bg-white">
      <h2 className="text-lg font-bold mb-2">{selectedAsset?.name || selectedAsset?.symbol}</h2>
      <div className="flex justify-between items-center mb-4">
        <span>Precio actual: <strong>${currentPrice.toFixed(2)}</strong></span>
      </div>

      {/* Tipo de operación */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Tipo de operación</label>
        <div className="flex">
          <button
            className={`flex-1 py-2 rounded-l ${operationType === "buy" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
            onClick={() => setOperationType("buy")}
          >
            Compra
          </button>
          <button
            className={`flex-1 py-2 rounded-r ${operationType === "sell" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700"}`}
            onClick={() => setOperationType("sell")}
          >
            Venta
          </button>
        </div>
      </div>

      {/* Cantidad de unidades */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Cantidad de unidades</label>
        <input
          className="w-full p-2 border rounded-md"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </div>

      {/* Resumen de operación */}
      <div className="mb-4 p-4 bg-gray-100 rounded-md">
        <h3 className="font-bold mb-2">Resumen de operación</h3>
        {priceError && (
          <p className="text-red-600 font-semibold mb-2">{priceError}</p>
        )}
        <p><strong>{operationType === "buy" ? "Costo total" : "Ingreso inicial"}:</strong> ${totalCost.toFixed(2)}</p>
        {takeProfit && <p><strong>Precio objetivo:</strong> ${takeProfit}</p>}
        {stopLoss && <p><strong>Stop Loss:</strong> ${stopLoss}</p>}
        {potentialProfit !== null && (
          <p className="text-green-600"><strong>Ganancia potencial:</strong> ${potentialProfit.toFixed(2)}</p>
        )}
        {potentialLoss !== null && (
          <p className="text-red-600"><strong>Pérdida potencial:</strong> ${potentialLoss.toFixed(2)}</p>
        )}
        {operationType === "sell" && (
          <p className="text-blue-600 text-xs mt-2">* En una venta (short), ganas si el precio baja y pierdes si sube.</p>
        )}
      </div>

      {/* Precio objetivo */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Precio objetivo (Take Profit)</label>
        <input
          type="number"
          className="w-full p-2 border rounded-md"
          value={takeProfit}
          onChange={(e) => setTakeProfit(Number(e.target.value))}
        />
      </div>

      {/* Stop Loss */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Stop Loss</label>
        <input
          type="number"
          className="w-full p-2 border rounded-md"
          value={stopLoss}
          onChange={(e) => setStopLoss(Number(e.target.value))}
        />
      </div>

      {/* Botón de ejecutar operación */}
      <button
        className="w-full py-2 rounded-md bg-blue-600 text-white"
        disabled={isExecuteDisabled}
        onClick={handleExecute}
      >
        Ejecutar operación
      </button>
    </div>
  );
};

export default TradingWindow;
