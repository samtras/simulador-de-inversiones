// -----------------------------------------------------------------------------
// Archivo: main.jsx
// Descripción: Punto de entrada de la aplicación React. Renderiza el árbol de
// componentes, aplica el contexto de autenticación global y monta la app en el DOM.
// -----------------------------------------------------------------------------

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Importa Tailwind CSS
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
