// -----------------------------------------------------------------------------
// Archivo: db.js
// Descripción: Configuración y función de conexión a la base de datos MongoDB
// usando Mongoose. Gestiona la conexión y maneja errores críticos de acceso.
// -----------------------------------------------------------------------------

const mongoose = require("mongoose");
require("dotenv").config();

/**
 * connectDB
 * Conecta la aplicación a la base de datos MongoDB usando Mongoose.
 * Utiliza la URI definida en las variables de entorno.
 * Si la conexión falla, muestra el error y termina el proceso.
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Conectado a MongoDB");
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
