// -----------------------------------------------------------------------------
// Archivo: Sidebar.jsx
// Descripción: Barra lateral de navegación. Permite acceder a las diferentes
// secciones de la aplicación, como dashboard, posiciones, órdenes, historial, etc.
// -----------------------------------------------------------------------------

import { BarChart2, FileText, Clock, Newspaper, Calendar, Settings, Home, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Componente Sidebar
 * Barra lateral de navegación que permite acceder a las distintas secciones de la aplicación.
 * Muestra los íconos y nombres de cada sección y gestiona la navegación según el estado de autenticación.
 */
const Sidebar = () => {
  // Obtiene el usuario autenticado del contexto
  const { user } = useContext(AuthContext);
  // Hook de navegación de React Router
  const navigate = useNavigate();

  // Definición de los ítems de la barra lateral con nombre, ícono y ruta
  const sidebarItems = [
    { name: "Dashboard", icon: Home, path: "/dashboard" },
    { name: "Portafolios", icon: Briefcase, path: "/portafolios" },
    { name: "Posiciones", icon: BarChart2, path: "/positions" },
    { name: "Órdenes", icon: FileText, path: "/orders" },
    { name: "Historial", icon: Clock, path: "/history" },
    { name: "Noticias", icon: Newspaper, path: "/news" },
    { name: "Calendario económico", icon: Calendar, path: "/calendar" },
    { name: "Preferencias", icon: Settings, path: "/settings" },
    { name: "Calculadora de Interés Compuesto", icon: BarChart2, path: "/calculadora-interes-compuesto" },
    { name: "Documentación", icon: FileText, path: "/documentation" },
  ];

  /**
   * handleNavigation
   * Gestiona la navegación al hacer clic en un ítem de la barra lateral.
   * Si el usuario no está autenticado, lo redirige a login; si está autenticado, navega a la ruta seleccionada.
   * @param {string} path - Ruta a la que se desea navegar
   */
  const handleNavigation = (path) => {
    navigate(path); // No verifiques user aquí, solo navega
  };

  // Renderiza la barra lateral con los ítems de navegación
  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4 text-2xl font-bold">Simulador de Inversiones</div>
      <nav className="space-y-2">
        <ul>
          {sidebarItems.map((item) => (
            <li
              key={item.name}
              className="p-4 hover:bg-gray-700 flex items-center cursor-pointer"
              onClick={() => handleNavigation(item.path)}
            >
              <item.icon className="mr-2 w-5 h-5" />
              <span>{item.name}</span>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
