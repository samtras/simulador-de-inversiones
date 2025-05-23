// -----------------------------------------------------------------------------
// Archivo: Positions.test.jsx
// Descripción: Prueba básica de renderizado para el componente Positions en React.
// Usa React Testing Library para verificar que el título se muestra correctamente.
// -----------------------------------------------------------------------------

import { render, screen } from '@testing-library/react';
import Positions from './Positions';

test('muestra el título de posiciones', () => {
  render(<Positions />);
  expect(screen.getByText(/posiciones/i)).toBeInTheDocument();
});
