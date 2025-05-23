// -----------------------------------------------------------------------------
// Archivo: Settings.jsx (página)
// Descripción: Página de configuración de usuario. Permite cambiar el tema y el saldo
// virtual desde la vista de usuario, sincronizando con el backend y frontend.
// -----------------------------------------------------------------------------

import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Settings = () => {
  const outlet = useOutletContext();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [pendingTheme, setPendingTheme] = useState(theme);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    setPendingTheme(theme);
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
    <div>
      <h1>Configuración</h1>
      <div>
        <label>
          Tema:
          <select value={pendingTheme} onChange={(e) => setPendingTheme(e.target.value)}>
            <option value="light">Claro</option>
            <option value="dark">Oscuro</option>
          </select>
        </label>
      </div>
      <button onClick={handleSaveChanges}>Guardar cambios</button>
      {showSuccessMessage && <p>Cambios guardados con éxito!</p>}
    </div>
  );
};

export default Settings;