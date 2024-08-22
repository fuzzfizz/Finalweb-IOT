"use client";
import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement);

interface SensorData {
  ldrData: number[];
  rainData: number[];
  flameData: number[];
  labels: string[];
  tableData: {
    Timestamp: string;
    LDR: number;
    RainSensor: number;
    FlameSensor: number;
  }[];
}

const Home = () => {
  const [ldrData, setLdrData] = useState<number[]>([]);
  const [rainData, setRainData] = useState<number[]>([]);
  const [flameData, setFlameData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [tableData, setTableData] = useState<SensorData["tableData"]>([]);
  const [isFireDetected, setIsFireDetected] = useState<boolean>(false);
  const [isRainDetected, setIsRainDetected] = useState<boolean>(false);

  const [rgbColor, setRgbColor] = useState<string>("");

  useEffect(() => {
    // Simulate data fetching
    const fetchData = async () => {
      const ldrData = [300, 400, 500, 600];
      const rainData = [3, 3, 3, 6];
      const flameData = [0, 0, 0, 1];
      const labels = ["08:00", "09:00", "10:00", "11:00"];
      const tableData = [
        {
          Timestamp: "2024-08-20 08:00:00",
          LDR: 300,
          RainSensor: 5,
          FlameSensor: 0,
        },
        {
          Timestamp: "2024-08-20 09:00:00",
          LDR: 400,
          RainSensor: 7,
          FlameSensor: 1,
        },
        {
          Timestamp: "2024-08-20 10:00:00",
          LDR: 500,
          RainSensor: 6,
          FlameSensor: 0,
        },
        {
          Timestamp: "2024-08-20 11:00:00",
          LDR: 600,
          RainSensor: 4,
          FlameSensor: 1,
        },
      ];

      setLdrData(ldrData);
      setRainData(rainData);
      setFlameData(flameData);
      setLabels(labels);
      setTableData(tableData);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (flameData.length > 0) {
      const latestFlameValue = flameData[flameData.length - 1];
      setIsFireDetected(latestFlameValue > 0);
    }
  }, [flameData]);

  useEffect(() => {
    if (rainData.length > 0) {
      const latestRainValue = rainData[rainData.length - 1];
      setIsRainDetected(latestRainValue > 5); // Example threshold for rain detection
    }
  }, [rainData]);

  const createChartData = (title: string, data: number[]) => ({
    labels,
    datasets: [
      {
        label: title,
        data,
        borderColor: "#4F46E5",
        backgroundColor: "rgba(79, 70, 229, 0.2)",
      },
    ],
  });

  const handleRgbChange = (color: string) => {
    setRgbColor(color);
    // Send color command to the server or hardware
    console.log(`RGB Color set to: ${color}`);
    // Example: fetch('/api/setRgbColor', { method: 'POST', body: JSON.stringify({ color }) });
  };

  return (
    <div className="flex flex-col p-6 bg-black min-h-screen ">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white">Sensor Dashboard</h1>
      </header>

      <main className="flex-1">
        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Sensor Data Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LDR Data Graph */}
            <div className="bg-white p-4 rounded-lg shadow-md text-black">
              <h3 className="text-xl font-semibold mb-2">LDR Data Graph</h3>
              <Line data={createChartData("LDR Data", ldrData)} />
            </div>
            {/* Rain Sensor Data Graph */}
            <div
              className={`p-4 rounded-lg shadow-md transition-colors duration-500 ${
                isRainDetected
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              <h3 className="text-xl font-semibold mb-2">
                Rain Sensor Data Graph
              </h3>
              <Line data={createChartData("Rain Sensor Data", rainData)} />
            </div>
            {/* Flame Sensor Data Graph */}
            <div
              className={`p-4 rounded-lg shadow-md transition-colors duration-500 ${
                isFireDetected
                  ? "bg-red-500 text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              <h3 className="text-xl font-semibold mb-2">
                Flame Sensor Data Graph
              </h3>
              <Line data={createChartData("Flame Sensor Data", flameData)} />
            </div>
          </div>
        </section>

        <section className="text-black">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Sensor Data Table
          </h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Timestamp</th>
                  <th className="py-2 px-4 border-b">LDR Value</th>
                  <th className="py-2 px-4 border-b">Rain Sensor Value</th>
                  <th className="py-2 px-4 border-b">Flame Sensor Value</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={index}>
                    <td className="py-2 px-4 border-b">{row.Timestamp}</td>
                    <td className="py-2 px-4 border-b">{row.LDR}</td>
                    <td className="py-2 px-4 border-b">{row.RainSensor}</td>
                    <td className="py-2 px-4 border-b">{row.FlameSensor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            RGB Control
          </h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex gap-4">
              <button
                onClick={() => handleRgbChange("red")}
                className="bg-red-500 text-white py-2 px-4 rounded"
              >
                Red
              </button>
              <button
                onClick={() => handleRgbChange("green")}
                className="bg-green-500 text-white py-2 px-4 rounded"
              >
                Green
              </button>
              <button
                onClick={() => handleRgbChange("blue")}
                className="bg-blue-500 text-white py-2 px-4 rounded"
              >
                Blue
              </button>
              <button
                onClick={() => handleRgbChange("white")}
                className="bg-gray-500 text-white py-2 px-4 rounded"
              >
                White
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
