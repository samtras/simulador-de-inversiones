// -----------------------------------------------------------------------------
// Archivo: Documentation.jsx
// Descripción: Página de documentación interactiva para el usuario. Explica el uso
// de cada sección de la app, los conceptos clave y la operativa del simulador.
// -----------------------------------------------------------------------------

import { CheckCircleIcon, InformationCircleIcon } from "@heroicons/react/24/solid";

const Documentation = () => {
  return (
    <div className="p-6 bg-gray-50 text-gray-800">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-blue-600 text-center">Documentación del Simulador de Inversiones</h1>
        <p className="mb-8 text-lg text-center">
          Aprende a usar el Simulador de Inversiones para practicar estrategias de compra y venta de activos financieros sin arriesgar dinero real.
        </p>

        {/* Sección: Conceptos Financieros Básicos */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-blue-500">Conceptos Financieros Básicos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-white shadow rounded-md">
              <h3 className="text-lg font-semibold mb-2">Activo financiero</h3>
              <p className="text-sm text-gray-600">Un activo financiero es cualquier instrumento que tiene valor y puede ser comprado o vendido, como acciones, bonos o fondos. En la app, cada activo representa una oportunidad de inversión.</p>
            </div>
            <div className="p-4 bg-white shadow rounded-md">
              <h3 className="text-lg font-semibold mb-2">Portafolio</h3>
              <p className="text-sm text-gray-600">Es el conjunto de activos que posees. El portafolio muestra tus inversiones actuales y su evolución.</p>
            </div>
            <div className="p-4 bg-white shadow rounded-md">
              <h3 className="text-lg font-semibold mb-2">Orden de compra/venta</h3>
              <p className="text-sm text-gray-600">Una orden es una instrucción para comprar o vender un activo. Puedes elegir entre orden de mercado (al precio actual) u orden limitada (a un precio específico).</p>
            </div>
            <div className="p-4 bg-white shadow rounded-md">
              <h3 className="text-lg font-semibold mb-2">Stop Loss</h3>
              <p className="text-sm text-gray-600">Es un mecanismo para limitar pérdidas. Si el precio del activo baja hasta el valor que defines, la app cerrará automáticamente la operación.</p>
            </div>
            <div className="p-4 bg-white shadow rounded-md">
              <h3 className="text-lg font-semibold mb-2">Take Profit (Precio objetivo)</h3>
              <p className="text-sm text-gray-600">Permite asegurar ganancias. Si el precio sube hasta el valor que defines, la app cerrará la operación para asegurar ese beneficio.</p>
            </div>
            <div className="p-4 bg-white shadow rounded-md">
              <h3 className="text-lg font-semibold mb-2">Variación (%)</h3>
              <p className="text-sm text-gray-600">Indica el cambio porcentual en el precio de un activo respecto al día anterior. Ayuda a identificar tendencias.</p>
            </div>
            <div className="p-4 bg-white shadow rounded-md">
              <h3 className="text-lg font-semibold mb-2">Fondos disponibles</h3>
              <p className="text-sm text-gray-600">Es el dinero virtual que tienes para invertir. Se actualiza cada vez que compras o vendes activos.</p>
            </div>
            <div className="p-4 bg-white shadow rounded-md">
              <h3 className="text-lg font-semibold mb-2">Gráfico de velas</h3>
              <p className="text-sm text-gray-600">Representa la evolución del precio de un activo en el tiempo. Cada vela muestra el precio de apertura, cierre, máximo y mínimo en un periodo.</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-md text-blue-700">
            <InformationCircleIcon className="inline-block w-5 h-5 mr-2 align-middle" />
            <span className="text-sm">Estos conceptos te ayudarán a comprender mejor las funciones del simulador y a practicar estrategias de inversión de manera segura.</span>
          </div>
        </section>

        {/* Sección: Dashboard */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-blue-500">Dashboard</h2>
          <p className="mb-4">
            En el Dashboard encontrarás una tabla con los activos disponibles. Cada columna tiene la siguiente información:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-white shadow rounded-md">
              <h3 className="text-lg font-semibold mb-2">Nombre del activo</h3>
              <p className="text-sm text-gray-600">Nombre de la empresa o activo financiero.</p>
            </div>
            <div className="p-4 bg-white shadow rounded-md">
              <h3 className="text-lg font-semibold mb-2">Precio actual</h3>
              <p className="text-sm text-gray-600">El precio más reciente del activo.</p>
            </div>
            <div className="p-4 bg-white shadow rounded-md">
              <h3 className="text-lg font-semibold mb-2">Precio anterior</h3>
              <p className="text-sm text-gray-600">El precio de cierre del día anterior.</p>
            </div>
            <div className="p-4 bg-white shadow rounded-md">
              <h3 className="text-lg font-semibold mb-2">Cambio</h3>
              <p className="text-sm text-gray-600">La diferencia entre el precio actual y el anterior.</p>
            </div>
            <div className="p-4 bg-white shadow rounded-md">
              <h3 className="text-lg font-semibold mb-2">Variación (%)</h3>
              <p className="text-sm text-gray-600">El porcentaje de cambio en el precio.</p>
            </div>
            <div className="p-4 bg-white shadow rounded-md">
              <h3 className="text-lg font-semibold mb-2">Acciones</h3>
              <p className="text-sm text-gray-600">Botón para ver el gráfico y operar sobre el activo.</p>
            </div>
          </div>
        </section>

        {/* Sección: Pantalla de Operaciones */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-blue-500">Pantalla de Operaciones</h2>
          <p className="mb-4">
            Al seleccionar un activo, puedes configurar y realizar operaciones. Estas son las opciones disponibles:
          </p>

          {/* Configuraciones del Gráfico */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Configuraciones del Gráfico</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-white shadow rounded-md">
                <h4 className="text-lg font-semibold mb-2">Tipo de gráfico</h4>
                <p className="text-sm text-gray-600">Selecciona entre velas, línea o área para visualizar los movimientos del precio.</p>
              </div>
              <div className="p-4 bg-white shadow rounded-md">
                <h4 className="text-lg font-semibold mb-2">Intervalo de tiempo</h4>
                <p className="text-sm text-gray-600">Elige cuántos días de historial quieres ver: 30, 60 o 100 días.</p>
              </div>
            </div>
          </div>

          {/* Formulario de Operación */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Formulario de Operación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-white shadow rounded-md">
                <h4 className="text-lg font-semibold mb-2">Tipo de operación</h4>
                <p className="text-sm text-gray-600">Elige entre Compra o Venta según tu estrategia.</p>
              </div>
              <div className="p-4 bg-white shadow rounded-md">
                <h4 className="text-lg font-semibold mb-2">Cantidad de unidades</h4>
                <p className="text-sm text-gray-600">Especifica cuántas acciones deseas comprar o vender.</p>
              </div>
              <div className="p-4 bg-white shadow rounded-md">
                <h4 className="text-lg font-semibold mb-2">Nivel de Knockout</h4>
                <p className="text-sm text-gray-600">Define un precio límite en el que tu posición se cerrará automáticamente.</p>
              </div>
              <div className="p-4 bg-white shadow rounded-md">
                <h4 className="text-lg font-semibold mb-2">Precio objetivo (Take Profit)</h4>
                <p className="text-sm text-gray-600">Especifica un precio para cerrar la operación automáticamente con ganancias.</p>
              </div>
              <div className="p-4 bg-white shadow rounded-md">
                <h4 className="text-lg font-semibold mb-2">Stop Loss</h4>
                <p className="text-sm text-gray-600">Determina un precio para cerrar la operación si el mercado va en contra.</p>
              </div>
              <div className="p-4 bg-white shadow rounded-md">
                <h4 className="text-lg font-semibold mb-2">Tipo de orden</h4>
                <p className="text-sm text-gray-600">Elige entre orden de mercado (precio actual) u orden limitada (precio definido).</p>
              </div>
            </div>
          </div>

          {/* Ejecutar Operación */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Ejecutar Operación</h3>
            <p className="text-sm text-gray-600">
              Pulsa el botón para registrar la orden. El sistema actualizará tu portafolio y fondos disponibles.
            </p>
          </div>
        </section>

        {/* Nota final */}
        <div className="p-6 bg-blue-100 border-l-4 border-blue-500 text-blue-700 rounded-md">
          <h4 className="text-lg font-semibold mb-2">Nota</h4>
          <p className="text-sm">
            Si tienes dudas adicionales, consulta con el soporte técnico o revisa las demás secciones de esta documentación.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
