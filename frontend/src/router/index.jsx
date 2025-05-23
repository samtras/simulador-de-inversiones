// -----------------------------------------------------------------------------
// Archivo: index.jsx
// Descripción: Definición de rutas principales para la navegación del frontend.
// Permite la navegación entre páginas como Home, About, Contacto y la calculadora
// de interés compuesto. Utiliza React Router para la gestión de rutas.
// -----------------------------------------------------------------------------

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import About from "../pages/About";
import Contact from "../pages/Contact";
import CompoundInterestCalculator from "../pages/CompoundInterestCalculator";

const routes = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/contact",
    element: <Contact />,
  },
  {
    path: "/calculadora-interes-compuesto",
    element: <CompoundInterestCalculator />,
  },
];

function AppRouter() {
  return (
    <Router>
      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>
    </Router>
  );
}

export default AppRouter;