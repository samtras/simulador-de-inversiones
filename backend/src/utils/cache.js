// -----------------------------------------------------------------------------
// Archivo: cache.js
// Descripción: Utilidad para almacenamiento temporal en memoria (caché) de
// respuestas de la API. Permite guardar y recuperar datos con expiración para
// optimizar el rendimiento y reducir llamadas externas.
// -----------------------------------------------------------------------------

const cache = new Map();

/**
 * getCache
 * Recupera un valor de la caché si no ha expirado.
 * @param {string} key - Clave de la caché
 * @returns {*} Valor almacenado o null si no existe o expiró
 */
function getCache(key) {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expiration) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

/**
 * setCache
 * Almacena un valor en la caché con un tiempo de vida (ttl) en milisegundos.
 * @param {string} key - Clave de la caché
 * @param {*} value - Valor a almacenar
 * @param {number} ttl - Tiempo de vida en milisegundos
 */
function setCache(key, value, ttl) {
  cache.set(key, { value, expiration: Date.now() + ttl });
}

module.exports = { getCache, setCache };
