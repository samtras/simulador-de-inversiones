// -----------------------------------------------------------------------------
// Archivo: Layout.jsx
// Descripción: Componente de layout general de la aplicación. Organiza la estructura
// visual, incluyendo la barra lateral, barra de navegación y el área principal de contenido.
// -----------------------------------------------------------------------------

import Sidebar from "./Sidebar";
import Navbar from "./NavBar";
import { Outlet } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { usePortfolio } from "../context/PortfolioContext";
import axios from "axios";

const API_URL = import.meta.env.BACKEND_API_URL || "http://localhost:5000/api";

/**
 * Componente Layout
 * Organiza la estructura visual principal de la aplicación, incluyendo la barra lateral,
 * la barra de navegación superior y el área de contenido principal.
 * Gestiona el saldo disponible del usuario y lo pasa como prop a Navbar y como contexto a las rutas hijas.
 */
const Layout = () => {
  // Obtiene el usuario autenticado del contexto
  const { user } = useContext(AuthContext);
  const { selectedPortfolioId, setSelectedPortfolioId, availableBalance, setAvailableBalance } = usePortfolio();

  // Solo consulta el saldo del portafolio activo
  useEffect(() => {
    const fetchPortfolioBalance = async () => {
      if (!selectedPortfolioId) return;
      try {
        const res = await axios.get(
          `${API_URL}/portfolios/${selectedPortfolioId}`
        );
        if (res.data && typeof res.data.fondoDisponible === 'number') {
          setAvailableBalance(res.data.fondoDisponible);
        } else {
          setAvailableBalance(0);
        }
      } catch (error) {
        setAvailableBalance(0);
      }
    };
    if (selectedPortfolioId) fetchPortfolioBalance();
  }, [selectedPortfolioId, setAvailableBalance]);

  // Nuevo: función para manejar selección de portafolio y actualizar saldo
  const handleSelectPortfolio = (portfolioId, balance) => {
    setSelectedPortfolioId(portfolioId);
    setAvailableBalance(balance);
  };

  // Renderiza la estructura principal: Sidebar, Navbar y área de contenido
  return (
    <div className="flex h-screen">
      <Sidebar saldoDisponible={availableBalance === undefined ? 0 : availableBalance} />
      <div className="flex-1 flex flex-col">
        <Navbar saldoDisponible={availableBalance === undefined ? 0 : availableBalance} />
        <div className="flex-1 overflow-auto">
          <Outlet
            context={{
              availableBalance: availableBalance === undefined ? 0 : availableBalance,
              selectedPortfolio: selectedPortfolioId,
              setSelectedPortfolio: setSelectedPortfolioId,
              handleSelectPortfolio,
              setAvailableBalance,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Layout;
