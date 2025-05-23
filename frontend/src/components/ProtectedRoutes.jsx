// -----------------------------------------------------------------------------
// Archivo: ProtectedRoutes.jsx
// Descripción: Componente que protege rutas privadas de la aplicación. Verifica
// si el usuario está autenticado y, en caso contrario, redirige al login. Muestra
// un loader mientras se valida el estado de autenticación.
// -----------------------------------------------------------------------------

import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoutes = () => {
  const { user, token, isLoading } = useContext(AuthContext);

  // Mostrar un loader mientras se carga el estado de autenticación
  if (isLoading) {
    return <div className="p-4 text-center">Cargando...</div>;
  }

  // Verificar si el usuario está autenticado
  if (!token || !user) {
    console.warn("Acceso denegado. Redirigiendo al login...");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;