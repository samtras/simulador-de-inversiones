// -----------------------------------------------------------------------------
// Archivo: NavBar.jsx
// Descripción: Barra de navegación superior. Muestra el nombre de la app, el saldo
// disponible y el botón para cerrar sesión. Permite navegación y logout seguro.
// -----------------------------------------------------------------------------

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

/**
 * Componente NavBar
 * Barra de navegación superior que muestra el nombre de la aplicación, el saldo disponible
 * y el botón para cerrar sesión. Permite navegación y logout seguro.
 * @param {number} saldoDisponible - Saldo disponible del usuario a mostrar
 */
const NavBar = ({ saldoDisponible }) => {
  // Obtiene la función de logout del contexto de autenticación
  const { logout } = useContext(AuthContext);
  // Hook de navegación de React Router
  const navigate = useNavigate();

  // Renderiza la barra de navegación con el saldo y el botón de logout
  return (
    <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <div className="text-xl">Simulador de Inversiones</div>
      <div className="flex items-center">
        <div className="mr-4">Fondo disponible: ${saldoDisponible.toFixed(2)}</div>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default NavBar;
