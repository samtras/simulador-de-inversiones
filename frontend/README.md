# Simulador de Inversiones

Este proyecto es un simulador de inversiones con frontend en React y backend en Node.js/Express/MongoDB.

---

## Requisitos previos

- [Node.js](https://nodejs.org/) (v18 o superior recomendado)
- [npm](https://www.npmjs.com/) (v9 o superior recomendado)
- [MongoDB](https://www.mongodb.com/) (puedes usar local o Atlas)
- Git

---

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/tuusuario/tu-repo.git
cd tu-repo
```

### 2. Instalar dependencias

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd ../frontend
npm install
```

---

### 3. Configurar las variables de entorno

El proyecto requiere **dos archivos `.env`**: uno en `/backend` y otro en `/frontend`.

#### `/backend/.env` (ejemplo):

```
MONGO_URI=mongodb://localhost:27017/simulador
PORT=5000
JWT_SECRET=clave-super-secreta
FMP_API_KEY=tu_api_key_de_financialmodelingprep
```

- `MONGO_URI`: URL de conexión a la base de datos MongoDB (local o Atlas).
- `PORT`: Puerto donde corre el backend (por defecto 5000).
- `FMP_API_KEY`: API Key
- `JWT_SECRET`= clave secreta
- Documentacion de la API: https://financialmodelingprep.com/

#### `/frontend/.env` (ejemplo):

```
VITE_API_URL=http://localhost:5000/api
```

- `VITE_API_URL`: URL base para que el frontend se comunique con el backend.

---

### 4. Iniciar la base de datos

Asegurese de que MongoDB esté corriendo en la máquina o usa use el del Atlas.

---

### 5. Ejecutar el backend

```bash
cd backend
npm run dev
```

---

### 6. Ejecutar el frontend

En otra terminal:

```bash
cd frontend
npm start
```

---

### 7. Acceder a la aplicación

Abra el navegador y vaya a [http://localhost:3000](http://localhost:3000) (o el puerto que haya configurado).

---
