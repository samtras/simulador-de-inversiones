import { createContext, useContext, useState, useEffect } from "react";

const PortfolioContext = createContext();

export const usePortfolio = () => useContext(PortfolioContext);

export const PortfolioProvider = ({ children }) => {
  // Inicializa con el valor de localStorage si existe
  const [selectedPortfolioId, setSelectedPortfolioId] = useState(
    localStorage.getItem("selectedPortfolio") || ""
  );
  const [availableBalance, setAvailableBalance] = useState(undefined);

  // Sincroniza con localStorage
  useEffect(() => {
    if (selectedPortfolioId) {
      localStorage.setItem("selectedPortfolio", selectedPortfolioId);
    } else {
      localStorage.removeItem("selectedPortfolio");
    }
  }, [selectedPortfolioId]);

  return (
    <PortfolioContext.Provider value={{ selectedPortfolioId, setSelectedPortfolioId, availableBalance, setAvailableBalance }}>
      {children}
    </PortfolioContext.Provider>
  );
};
