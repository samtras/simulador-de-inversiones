# Documentación Técnica y Resumen del Simulador de Inversiones

## Arquitectura General

El simulador está compuesto por dos grandes módulos:
- **Frontend (React):** Interfaz de usuario moderna, responsiva y modular, con componentes para trading, visualización de posiciones, historial, noticias, gráficos y utilidades.
- **Backend (Node.js + Express + MongoDB):** API RESTful que gestiona autenticación, usuarios, órdenes, datos de mercado, noticias y lógica de negocio.

---

## Estructura de Carpetas

- **frontend/src/components/**: Componentes visuales reutilizables (TradingWindow, Positions, Orders, Sidebar, etc.).
- **frontend/src/pages/**: Páginas principales de la app (Dashboard, Login, Register, Settings, etc.).
- **frontend/src/context/**: Contextos globales (ej. AuthContext para autenticación).
- **backend/src/controllers/**: Lógica de negocio para autenticación y operaciones.
- **backend/src/models/**: Modelos de datos (User, Order) con validaciones y hooks.
- **backend/src/routes/**: Endpoints de la API para usuarios, órdenes, datos de mercado, etc.
- **backend/src/middleware/**: Middlewares para autenticación y autorización.
- **backend/src/utils/**: Utilidades como caché en memoria.
- **backend/src/config/**: Configuración de base de datos.

---

## Principales Flujos y Funciones

### Autenticación y Usuarios
- **Registro/Login:**
  - Valida credenciales, hashea contraseñas y genera tokens JWT.
  - Middleware protege rutas privadas y permite restricción por rol.
- **Modelo User:**
  - email, password (hash), role, balance virtual inicial.
  - Hook pre-save para hashear contraseña.

### Trading y Órdenes
- **Creación de Órdenes:**
  - Valida saldo, tipo de operación (compra/venta), parámetros de riesgo.
  - Ajusta balance según operación y guarda la orden.
- **Cierre de Órdenes:**
  - Manual o automático (por stopLoss/takeProfit).
  - Calcula resultado, ajusta balance y marca la orden como cerrada.
- **Modelo Order:**
  - userId, symbol, tipoOperacion, cantidad, precios, stopLoss, takeProfit, estado, resultado, fechas, razón de cierre.

### Datos de Mercado y Noticias
- **marketDataRoutes:**
  - Cotizaciones actuales, históricos, noticias, calendario económico, dividendos, splits.
  - Uso de caché para optimizar llamadas a APIs externas.
  - Proceso automatizado para actualizar precios y auto-cerrar órdenes.

### Utilidades y Middleware
- **authMiddleware:**
  - Valida JWT y restringe acceso por rol.
- **cache.js:**
  - Almacenamiento temporal en memoria con expiración.
- **db.js:**
  - Conexión y gestión de errores con MongoDB.

---

## Ejemplo de Documentación en Código

Cada función, hook y endpoint relevante está documentado en el código fuente con:
- Propósito
- Entradas y salidas
- Lógica principal

Ejemplo:
```js
/**
 * register
 * Registra un nuevo usuario en la base de datos.
 * - Verifica si el correo ya está registrado.
 * - Si no existe, crea un nuevo usuario con el correo, contraseña (hasheada) y rol.
 * - Devuelve un mensaje de éxito o error.
 * @param {Request} req - Objeto de solicitud HTTP (debe contener email, password y opcionalmente role)
 * @param {Response} res - Objeto de respuesta HTTP
 */
```

---

## Buenas Prácticas
- Código modular y reutilizable.
- Separación clara entre lógica de negocio, modelos, rutas y utilidades.
- Documentación en cada función y archivo clave.
- Manejo de errores y validaciones robustas.
- Uso de caché para eficiencia.

---

## Contacto y Soporte
Para dudas técnicas, sugerencias o reportes, contactar al equipo de desarrollo.

---

**Última actualización:** 21 de mayo de 2025