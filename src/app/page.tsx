"use client";
import React, { useState, useEffect } from "react";
import { ATH034 } from "@prisma/client";
import API from "@/libs/API";
import io from "socket.io-client";
import Decimal from "decimal.js";

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

  useEffect(() => {
    getAllData();
    const socket = new WebSocket(
      "ws://eb26-2001-44c8-45d0-ac46-81c0-3f8d-4978-168c.ngrok-free.app/sensors"
    );

    fetch("http://eb26-2001-44c8-45d0-ac46-81c0-3f8d-4978-168c.ngrok-free.app/")
      .then(() => {
        // หลังจาก request สำเร็จแล้วจึงเชื่อมต่อกับ WebSocket ที่ path `/sensors`
        const socket = new WebSocket(
          "wss://eb26-2001-44c8-45d0-ac46-81c0-3f8d-4978-168c.ngrok-free.app/sensors"
        );

        socket.onmessage = function (event: MessageEvent) {
          const data = JSON.parse(event.data);
          // สมมติว่าโครงสร้างข้อมูลที่ได้รับจาก WebSocket ตรงกับโครงสร้างที่คุณต้องการใช้ใน recentData
          const formattedData: ATH034 = {
            id: Date.now(), // ใช้ timestamp เป็น id ชั่วคราว
            flame_status: new Decimal(data.flame), // แปลงค่าเป็น Decimal
            mq2_value: new Decimal(data.gas_level), // แปลงค่าเป็น Decimal
            rgb_status: data.flame === 0 ? "red" : "green",
            buzzer_value: new Decimal(0), // แปลงค่าเป็น Decimal
            date_time: new Date(),
          };
          setRecentData([formattedData]);
          console.log("Received recent update:", data);
        };
      })
      .catch((error) => {
        console.error("Error connecting to the server:", error);
      });
  }, []);

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Sensor Dashboard</h1>
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
                <th className="py-2 px-4 border-b">Analog1</th>
                <th className="py-2 px-4 border-b">Analog2</th>
                <th className="py-2 px-4 border-b">Digital1</th>
                <th className="py-2 px-4 border-b">Digital2</th>
                <th className="py-2 px-4 border-b">Date</th>
                <th className="py-2 px-4 border-b">Delete</th>
              </tr>
            </thead>
            <tbody>
              {sensorData.map((data) => (
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
                    {data?.buzzer_value?.toString()}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
