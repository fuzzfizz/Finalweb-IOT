"use client";
import React, { useState, useEffect } from "react";
import type { ATH034 } from "@prisma/client";
import API from "@/libs/API";

export default function Page() {
  const [sensorData, setSensorData] = useState<ATH034[]>([]);
  const [recentData, setRecentData] = useState<ATH034[]>([]);

  async function getAllData() {
    try {
      const res = await API.get("/api/iot");
      setSensorData(res.data.result);
      console.log(res.data.result);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  async function getRecentData() {
    try {
      const res = await API.get("/api/fetchrecent");
      setRecentData(res.data.result);
      console.log(res.data.result);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  // รับค่า id จาก button แล้วลบข้อมูลใน database ที่มี id ตรงกับค่าที่รับมา
  async function handleDel(id: string) {
    try {
      const res = await API.delete(`/api/iot`, {
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
    getRecentData();
  }, []);

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Sensor Dashboard</h1>
      {recentData.length > 0 && (
        <div
          key={recentData[0].id}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 text-gray-700"
        >
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold">Analog1</h2>
            <p>{recentData[0].analog1?.toString()}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold">Analog2</h2>
            <p>{recentData[0].analog2?.toString()}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold">Digital1</h2>
            <p>{recentData[0].digital1?.toString()}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold">Digital2</h2>
            <p>{recentData[0].digital2?.toString()}</p>
          </div>
        </div>
      )}
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
                <tr key={data.id}>
                  <td className="py-2 px-4 border-b">{data.id}</td>
                  <td className="py-2 px-4 border-b">
                    {data.analog1?.toString()}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {data.analog2?.toString()}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {data.digital1?.toString()}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {data.digital2?.toString()}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {data.date_time?.toString()}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      onClick={() => handleDel(data.id.toString())}
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
