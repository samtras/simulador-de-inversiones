// -----------------------------------------------------------------------------
// Archivo: Settings.jsx (componente)
// Descripción: Componente de preferencias de usuario. Permite cambiar el tema y
// actualizar el saldo virtual desde el panel de usuario, sincronizando con backend.
// -----------------------------------------------------------------------------

import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { useOutletContext } from "react-router-dom";

const Settings = () => {
  const { user } = useContext(AuthContext);
  const { availableBalance, handleBalanceUpdate } = useOutletContext(); // Obtener saldo y función de actualización
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [pendingTheme, setPendingTheme] = useState(theme); // Tema pendiente de guardar
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    // Aplicar el tema al cargar el componente
    document.documentElement.className = theme;
  }, [theme]);

  const handleSaveChanges = async () => {
    try {
      // Guardar el tema en localStorage y aplicarlo
      localStorage.setItem("theme", pendingTheme);
      setTheme(pendingTheme);

      // Mostrar mensaje de éxito
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error("Error al guardar los cambios:", error.message);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Preferencias</h2>
      <div className="space-y-4">
        {/* Tema */}
        <div>
          <label className="block text-sm font-medium">Tema</label>
          <select
            value={pendingTheme}
            onChange={(e) => setPendingTheme(e.target.value)} // Actualizar tema pendiente
            className="w-full p-2 border rounded-md"
            style={{
              backgroundColor: "var(--card-background)",
              color: "var(--card-foreground)",
              borderColor: "var(--border)",
            }}
          >
            <option value="light">Claro</option>
            <option value="dark">Oscuro</option>
          </select>
        </div>

        {/* Botón para guardar cambios */}
        <button
          onClick={handleSaveChanges}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Guardar cambios
        </button>

        {/* Mensaje de éxito */}
        {showSuccessMessage && (
          <p className="text-green-600 mt-2">¡Cambios guardados exitosamente!</p>
        )}
      </div>
    </div>
  );
};

export default Settings;
