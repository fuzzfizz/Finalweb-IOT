"use client";
import React, { useState, useEffect } from "react";
import { ATH034 } from "@prisma/client";
import API from "@/libs/API";
import Decimal from "decimal.js";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Register the necessary components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Page() {
  const [sensorData, setSensorData] = useState<ATH034[]>([]);
  const [recentData, setRecentData] = useState<ATH034[]>([]);

  async function getAllData() {
    try {
      const res = await API.get("/api/fetch");
      setSensorData(res.data.result);
      console.log(res.data.result);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  async function getRecentData() {
    try {
      const res = await API.get("/api/fetch");
      setRecentData(res.data.result);
      console.log(res.data.result);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  async function handleDel(id: number) {
    try {
      const res = await API.delete(`/api/iot/get`, {
        headers: {
          "Content-Type": "application/json",
        },
        data: { id },
      });
      getAllData();
      console.log(res.data.result);
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  }

  async function fetchData() {
    await fetch(
      "https://0e2b-2001-44c8-45d0-ac46-acd5-45cc-f0-d156.ngrok-free.app"
    )
      .then(() => {
        // หลังจาก request สำเร็จแล้วจึงเชื่อมต่อกับ WebSocket ที่ path `/sensors`
        const socket = new WebSocket(
          "wss://0e2b-2001-44c8-45d0-ac46-acd5-45cc-f0-d156.ngrok-free.app/sensors"
        );

        socket.onopen = () => {
          console.log("WebSocket connection established");
        };

        socket.onmessage = function (event: MessageEvent) {
          const data = JSON.parse(
            event.data.replace(/"rgb":\s*(\w+)/g, '"rgb": "$1"')
          );
          // สมมติว่าโครงสร้างข้อมูลที่ได้รับจาก WebSocket ตรงกับโครงสร้างที่คุณต้องการใช้ใน recentData
          const formattedData: ATH034 = {
            id: Date.now(), // ใช้ timestamp เป็น id ชั่วคราว
            flame_status: new Decimal(data.flame), // แปลงค่าเป็น Decimal
            mq2_value: new Decimal(data.gas_level), // แปลงค่าเป็น Decimal
            rgb_status: data.flame === 0 ? "red" : "green",
            buzzer_value: new Decimal(data.buzzer), // แปลงค่าเป็น Decimal
            date_time: new Date(),
          };
          setRecentData([formattedData]);
          console.log("Received recent update:", data);
        };

        socket.onerror = (error) => {
          console.error("WebSocket error:", error);
        };

        socket.onclose = () => {
          console.log("WebSocket connection closed");
        };
      })
      .catch((error) => {
        console.error("Error connecting to the server:", error);
      });
  }

  useEffect(() => {
    fetchData();
    getAllData();
  }, []);

  const lineChartData = {
    labels: sensorData.map((data) =>
      data?.date_time ? new Date(data.date_time).toLocaleString("th-TH") : ""
    ),
    datasets: [
      {
        label: "MQ2 Value",
        data: sensorData.map((data) => {
          // ตรวจสอบและแปลงค่า mq2_value ให้เป็นตัวเลข
          if (data?.mq2_value instanceof Decimal) {
            return data.mq2_value.toNumber();
          } else if (typeof data?.mq2_value === "number") {
            return data.mq2_value;
          } else {
            return 0; // หรือค่าเริ่มต้นที่เหมาะสม
          }
        }),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const, // ระบุประเภทให้ตรงกับที่ Chart.js กำหนด
      },
      title: {
        display: true,
        text: "MQ2 Value Over Time",
      },
    },
  };

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Sensor Dashboard</h1>
      {recentData[0]?.flame_status?.equals(1) ? (
        <div className="bg-red-500 text-white p-4 rounded shadow mb-4">
          <h2 className="text-xl font-semibold">Fire Alert!</h2>
          <p>Fire detected! Please take immediate action.</p>
        </div>
      ) : (
        <div className="bg-green-500 text-white p-4 rounded shadow mb-4">
          <h2 className="text-xl font-semibold">No Fire</h2>
          <p>Everything is normal. No fire detected.</p>
        </div>
      )}
      <div className="bg-white p-4 rounded shadow text-black mt-8 mb-8">
        <h2 className="text-xl font-semibold mb-4">MQ2 Value Over Time</h2>
        <Line data={lineChartData} options={lineChartOptions} />
      </div>
      <div
        key={recentData[0]?.id}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 text-gray-700"
      >
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold">flame_status</h2>
          <p>
            {recentData[0]?.flame_status?.toString() || "No data available"}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold">mq2_value</h2>
          <p>{recentData[0]?.mq2_value?.toString() || "No data available"}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold">rgb_status</h2>
          <p>{recentData[0]?.rgb_status?.toString() || "No data available"}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold">buzzer_value</h2>
          <p>
            {recentData[0]?.buzzer_value?.toString() || "No data available"}
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow text-black">
        <h2 className="text-xl font-semibold mb-4">Historical Data</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-center">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">flame_status</th>
                <th className="py-2 px-4 border-b">mq2_value</th>
                <th className="py-2 px-4 border-b">rgb_status</th>
                <th className="py-2 px-4 border-b">Date</th>
                <th className="py-2 px-4 border-b">Delete</th>
              </tr>
            </thead>
            <tbody>
              {sensorData && sensorData.length > 0 ? (
                sensorData
                  .slice()
                  .sort((a, b) => a.id - b.id)
                  .map((data) => (
                    <tr key={data?.id}>
                      <td className="py-2 px-4 border-b">{data.id}</td>
                      <td className="py-2 px-4 border-b">
                        {data?.flame_status?.toString() || "No data available"}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {data?.mq2_value?.toString()}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {data?.rgb_status?.toString()}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {data?.date_time
                          ? new Date(data.date_time).toLocaleString("th-TH")
                          : ""}
                      </td>
                      <td className="py-2 px-4 border-b">
                        <button
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                          onClick={() => handleDel(data.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-2 px-4 border-b">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
