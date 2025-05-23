// -----------------------------------------------------------------------------
// Archivo: AuthContext.jsx
// Descripción: Contexto global de autenticación. Provee el estado y funciones
// para login, registro, logout y persistencia de usuario/token en localStorage.
// Permite proteger rutas y compartir el usuario autenticado en toda la app.
// -----------------------------------------------------------------------------

import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Estado de carga

  useEffect(() => {
    // Cargar el usuario y el token desde localStorage al iniciar la aplicación
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    try {
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (error) {
      console.error("Error al cargar el usuario desde localStorage:", error);
      localStorage.removeItem("user"); // Eliminar datos corruptos
      localStorage.removeItem("token");
    } finally {
      setIsLoading(false); // Finalizar la carga
    }
  }, []);

  const register = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", { email, password });
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      setToken(res.data.token);
      // Limpiar selección de portafolio al registrar
      localStorage.removeItem("selectedPortfolio");
    } catch (error) {
      console.error("Error en el registro:", error.response?.data?.message || error.message);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      setToken(res.data.token);
      // Limpiar selección de portafolio al login
      localStorage.removeItem("selectedPortfolio");
    } catch (error) {
      // Quita el console.error para no mostrar el error en consola
      // console.error("Error en el inicio de sesión:", error.response?.data?.message || error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    // Limpiar selección de portafolio al logout
    localStorage.removeItem("selectedPortfolio");
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};