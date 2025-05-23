// -----------------------------------------------------------------------------
// Archivo: CompoundInterestCalculator.jsx
// Descripción: Página que implementa una calculadora de interés compuesto interactiva.
// Permite al usuario simular el crecimiento de una inversión con depósitos periódicos,
// mostrando resultados y gráficos detallados.
// -----------------------------------------------------------------------------

import { useState } from "react";
import Chart from "react-apexcharts";
import Layout from "../components/Layout"; // Importar el diseño principal

const CompoundInterestCalculator = () => {
  const [initialBalance, setInitialBalance] = useState(0);
  const [periodicDeposit, setPeriodicDeposit] = useState(0);
  const [depositFrequency, setDepositFrequency] = useState("monthly");
  const [depositTiming, setDepositTiming] = useState("end");
  const [annualRate, setAnnualRate] = useState(0);
  const [duration, setDuration] = useState(0);
  const [results, setResults] = useState(null);

  const calculate = () => {
    const frequencyMap = { monthly: 12, quarterly: 4, yearly: 1 };
    const periodsPerYear = frequencyMap[depositFrequency];
    const ratePerPeriod = annualRate / 100 / periodsPerYear;

    let balance = initialBalance;
    let totalDeposits = 0;
    let totalInterest = 0;
    const breakdown = [];

    for (let year = 1; year <= duration; year++) {
      let yearDeposits = 0;
      let yearInterest = 0;

      for (let period = 1; period <= periodsPerYear; period++) {
        if (depositTiming === "start") {
          balance += periodicDeposit;
          yearDeposits += periodicDeposit;
        }

        const interest = balance * ratePerPeriod;
        balance += interest;
        yearInterest += interest;

        if (depositTiming === "end") {
          balance += periodicDeposit;
          yearDeposits += periodicDeposit;
        }
      }

      totalDeposits += yearDeposits;
      totalInterest += yearInterest;
      breakdown.push({
        year,
        deposits: totalDeposits,
        interest: totalInterest,
        balance: balance.toFixed(2),
      });
    }

    setResults({
      totalBalance: balance.toFixed(2),
      totalDeposits,
      totalInterest: totalInterest.toFixed(2),
      breakdown,
    });
  };

  return (
    <div className="flex-1 overflow-auto p-4"> {/* Ajuste para que sea visible */}
      <h2 className="text-lg font-bold mb-4">Calculadora de Interés Compuesto</h2>
      <div className="space-y-4">
        {/* Inputs */}
        <div>
          <label className="block text-sm font-medium">Balance inicial</label>
          <input
            type="number"
            value={initialBalance}
            onChange={(e) => setInitialBalance(Number(e.target.value))}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Depósito periódico</label>
          <input
            type="number"
            value={periodicDeposit}
            onChange={(e) => setPeriodicDeposit(Number(e.target.value))}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Frecuencia del depósito</label>
          <select
            value={depositFrequency}
            onChange={(e) => setDepositFrequency(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="monthly">Mensual</option>
            <option value="quarterly">Trimestral</option>
            <option value="yearly">Anual</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Momento del depósito</label>
          <select
            value={depositTiming}
            onChange={(e) => setDepositTiming(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="start">Al inicio</option>
            <option value="end">Al final</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Tasa de interés anual (%)</label>
          <input
            type="number"
            value={annualRate}
            onChange={(e) => setAnnualRate(Number(e.target.value))}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Duración (años)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <button
          onClick={calculate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Calcular
        </button>

        {/* Results */}
        {results && (
          <div className="mt-6">
            <h3 className="text-lg font-bold">Resultados</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-md">
                <h4 className="font-bold">Balance Inicial</h4>
                <p>${initialBalance.toFixed(2)}</p>
              </div>
              <div className="p-4 border rounded-md">
                <h4 className="font-bold">Depósitos Periódicos</h4>
                <p>${results.totalDeposits.toFixed(2)}</p>
              </div>
              <div className="p-4 border rounded-md">
                <h4 className="font-bold">Interés Total</h4>
                <p>${results.totalInterest}</p>
              </div>
            </div>

            {/* Gráficos */}
            <div className="mt-6">
              <Chart
                options={{
                  labels: ["Balance Inicial", "Depósitos", "Intereses"],
                  colors: ["#1a73e8", "#34a853", "#fbbc05"],
                  chart: { background: "#ffffff" }, // Fondo claro
                  dataLabels: {
                    enabled: true,
                    formatter: (value) => value.toFixed(2), // Limitar etiquetas a 2 decimales
                  },
                }}
                series={[initialBalance, results.totalDeposits, results.totalInterest]}
                type="pie"
                height={300}
              />
              <Chart
                options={{
                  chart: { stacked: true, background: "#ffffff" }, // Fondo claro
                  xaxis: { categories: results.breakdown.map((row) => `Año ${row.year}`) },
                  colors: ["#1a73e8", "#34a853", "#fbbc05"],
                  yaxis: {
                    labels: {
                      formatter: (value) => value.toFixed(2), // Limitar a 2 decimales
                    },
                  },
                  dataLabels: {
                    enabled: true,
                    formatter: (value) => value.toFixed(2), // Limitar etiquetas a 2 decimales
                  },
                }}
                series={[
                  { name: "Balance Inicial", data: Array(results.breakdown.length).fill(initialBalance) },
                  { name: "Depósitos", data: results.breakdown.map((row) => row.deposits) },
                  { name: "Intereses", data: results.breakdown.map((row) => row.interest) },
                ]}
                type="bar"
                height={300}
              />
            </div>

            {/* Tabla desglosada */}
            <div className="mt-6">
              <h4 className="text-lg font-bold mb-4">Desglose por Año</h4>
              <table className="min-w-full bg-white border">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Año</th>
                    <th className="py-2 px-4 border-b">Depósitos Acumulados</th>
                    <th className="py-2 px-4 border-b">Intereses Acumulados</th>
                    <th className="py-2 px-4 border-b">Balance Final</th>
                  </tr>
                </thead>
                <tbody>
                  {results.breakdown.map((row) => (
                    <tr key={row.year}>
                      <td className="py-2 px-4 border-b">{row.year}</td>
                      <td className="py-2 px-4 border-b">${row.deposits.toFixed(2)}</td>
                      <td className="py-2 px-4 border-b">${row.interest.toFixed(2)}</td>
                      <td className="py-2 px-4 border-b">${row.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompoundInterestCalculator;
