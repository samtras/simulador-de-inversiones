// -----------------------------------------------------------------------------
// Archivo: App.jsx
// Descripción: Componente principal de la aplicación React. Define la estructura
// de rutas públicas y protegidas usando React Router, y organiza la navegación
// entre páginas como login, registro, dashboard, operaciones, historial, etc.
// -----------------------------------------------------------------------------

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "./pages/LoginForm";
import RegisterForm from "./pages/RegisterForm";
import Dashboard from "./pages/Dashboard";
import ProtectedRoutes from "./components/ProtectedRoutes";
import Positions from "./components/Positions";
import Orders from "./components/Orders";
import History from "./components/History";
import News from "./components/News";
import Calendar from "./components/Calendar";
import Settings from "./components/Settings";
import Layout from "./components/Layout"; // Importar el nuevo componente Layout
import CompoundInterestCalculator from "./pages/CompoundInterestCalculator"; // Importar la calculadora
import Documentation from "./pages/Documentation"; // Importar la nueva página
import Portfolios from "./pages/Portfolios";
import { PortfolioProvider } from "./context/PortfolioContext";

function App() {
  return (
    <PortfolioProvider>
      <Router>
        <Routes>
          {/* Páginas públicas */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* Páginas protegidas */}
          <Route element={<ProtectedRoutes />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/positions" element={<Positions />} />
              <Route path="/orders" element={<Orders estado="Abierta" />} />
              <Route path="/history" element={<History estado="Cerrada" />} />
              <Route path="/news" element={<News />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/portafolios" element={<Portfolios />} />
            </Route>
          </Route>

          {/* Ruta pública para la calculadora */}
          <Route element={<Layout />}>
            <Route path="/calculadora-interes-compuesto" element={<CompoundInterestCalculator />} />
          </Route>

          {/* Nueva ruta para la documentación */}
          <Route element={<Layout />}>
            <Route path="/documentation" element={<Documentation />} /> {/* Nueva ruta */}
          </Route>

          {/* Redirigir cualquier ruta desconocida */}
          <Route path="*" element={<LoginForm />} />
        </Routes>
      </Router>
    </PortfolioProvider>
  );
}

export default App;
