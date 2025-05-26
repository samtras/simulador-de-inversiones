// -----------------------------------------------------------------------------
// Archivo: News.jsx
// Descripción: Componente que muestra las noticias financieras relevantes.
// Permite ver titulares, detalles, autores y abrir noticias en un modal.
// -----------------------------------------------------------------------------

import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, '');

/**
 * Componente News
 * Muestra una lista de noticias financieras relevantes obtenidas desde la API.
 * Permite ver detalles de cada noticia en un modal emergente.
 */
const News = () => {
  // Estado para almacenar las noticias obtenidas de la API
  const [news, setNews] = useState([]);
  // Estado de carga
  const [loading, setLoading] = useState(true);
  // Estado de error
  const [error, setError] = useState(null);
  // Estado para la noticia seleccionada (para mostrar en modal)
  const [selectedNews, setSelectedNews] = useState(null);

  /**
   * useEffect para cargar las noticias al montar el componente.
   * Llama a la API para obtener las noticias y las almacena en el estado.
   */
  useEffect(() => {
    /**
     * fetchNews
     * Función asíncrona que obtiene las noticias desde la API.
     * - Maneja estados de carga y error.
     */
    const fetchNews = async () => {
      try {
        const response = await axios.get(`${API_URL}/market-data/news`);
        setNews(response.data);
      } catch {
        setError("Error al cargar las noticias.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  /**
   * handleOpenModal
   * Abre el modal para mostrar los detalles de una noticia seleccionada.
   * @param {object} newsItem - Objeto de la noticia seleccionada
   */
  const handleOpenModal = (newsItem) => setSelectedNews(newsItem);

  /**
   * handleCloseModal
   * Cierra el modal de detalles de la noticia.
   */
  const handleCloseModal = () => setSelectedNews(null);

  // Renderiza mensajes de carga, error o ausencia de noticias
  if (loading) return <div className="p-4">Cargando noticias...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (news.length === 0) return <div className="p-4">No hay noticias disponibles por ahora.</div>;

  // Renderiza la lista de noticias y el modal de detalles si corresponde
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Noticias Financieras</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {news.map((item, index) => (
          <div key={index} className="flex flex-col border rounded-md shadow p-4 bg-white">
            {item.image && (
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-40 object-cover rounded-md mb-4"
              />
            )}
            <h3 className="text-xl font-bold">{item.title}</h3>
            <p className="text-sm mb-2">
              {new Date(item.date).toLocaleString("es-ES", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            {item.tickers && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                {item.tickers}
              </span>
            )}
            <p className="text-sm mt-2">
              {item.author && `${item.author}`} {item.site && `| Fuente: ${item.site}`}
            </p>
            <button
              onClick={() => handleOpenModal(item)}
              className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Leer más
            </button>
          </div>
        ))}
      </div>

      {selectedNews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-hidden relative">
            <div className="overflow-y-auto max-h-[80vh] pr-4">
              <h3 className="text-2xl font-bold mb-4">{selectedNews.title}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {new Date(selectedNews.date).toLocaleString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <div
                className="text-sm text-gray-700 mb-4"
                dangerouslySetInnerHTML={{ __html: selectedNews.content }}
              ></div>
              {selectedNews.tickers && (
                <p className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-md inline-block mb-4">
                  {selectedNews.tickers}
                </p>
              )}
              <p className="text-sm text-gray-500">
                {selectedNews.author && `${selectedNews.author}`} {" "}
                {selectedNews.site && `| Fuente: ${selectedNews.site}`}
              </p>
            </div>
            <button
              onClick={handleCloseModal}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default News;
