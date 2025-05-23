// -----------------------------------------------------------------------------
// Archivo: RegisterForm.jsx
// Descripción: Página de registro de usuario. Permite crear una cuenta nueva con
// correo y contraseña, validando los datos y mostrando mensajes de error.
// -----------------------------------------------------------------------------

import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    try {
      await register(email, password);
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.status === 400) {
        setError("El correo ya está registrado");
      } else {
        setError("Error en el registro");
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Registro</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-md text-gray-900 placeholder-gray-500 bg-gray-800 text-white"
              required
            />
          </div>
          <div className="mb-4 relative">
            <label className="block text-gray-700">Contraseña</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded-md pr-10 text-gray-900 placeholder-gray-500 bg-gray-800 text-white"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-2/4 transform -translate-y-1/2 text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>
          <div className="mb-4 relative">
            <label className="block text-gray-700">Confirmar Contraseña</label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded-md pr-10 text-gray-900 placeholder-gray-500 bg-gray-800 text-white"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-2/4 transform -translate-y-1/2 text-gray-600"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>
          <button type="submit" className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700">
            Registrarse
          </button>
          <p className="mt-4 text-center text-gray-600">
            ¿Ya tienes cuenta? <Link to="/login" className="text-blue-600 hover:underline">Inicia sesión</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
