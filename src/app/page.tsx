"use client";
import React, { useState, useEffect, SVGProps, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
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
import Decimal from "decimal.js";
import API from "@/libs/API";
import { updateBuzzerValue } from "@/lib/utils/api";
import { ATH034 } from "@prisma/client";

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
  const [volume, setVolume] = useState<number>(50);
  const [data, setData] = useState({
    labels: [],
    datasets: [
      {
        label: "MQ2 Value",
        data: [],
        fill: false,
        borderColor: "rgba(75,192,192,1)",
        tension: 0.1,
      },
    ],
  });

  const chartRef = useRef(null);

  async function fetchData() {
    const result = await API.get("/api/fetch");
    const sortedSensorData = result.data.result.sort(
      (a: { id: number }, b: { id: number }) => a.id - b.id
    );

    const mq2Values = sortedSensorData.map(
      (data: { mq2_value: any }) => data.mq2_value ?? 0
    );
    const timestamps = sortedSensorData.map(
      (data: { time: string | number | Date }) =>
        data.time
          ? new Date(data.time).toLocaleTimeString("th-TH", {
              timeZone: "Asia/Bangkok",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          : ""
    );

    setData({
      labels: timestamps,
      datasets: [
        {
          label: "MQ2 Value",
          data: mq2Values,
          fill: false,
          borderColor: "rgba(75,192,192,1)",
          tension: 0.1,
        },
      ],
    });
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]); // Slider returns an array, so we use the first value
  };

  const handleSubmit = async () => {
    try {
      await updateBuzzerValue(volume);
      console.log("Buzzer value updated successfully");
    } catch (error) {
      console.error("Error updating buzzer value:", error);
    }
  };

  async function getAllData() {
    try {
      const res = await API.get("/api/fetch");
      setSensorData(res.data.result);
      console.log(res.data.result);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  const handleDel = async (id: number) => {
    try {
      const res = await fetch(`/api/iot/delete`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await res.json();
      console.log(result);

      getAllData();
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  useEffect(() => {
    getAllData();
    fetchData();

    const socket = new WebSocket(
      "wss://474f-2001-44c8-45d0-ac46-9016-ec83-a61d-c977.ngrok-free.app/sensors"
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
        date: new Date(),
        time: null,
      };
      setRecentData([formattedData]);
      console.log("Received recent update:", data);
    };
    const intervalId = setInterval(() => {
      getAllData();
    }, 10000); // 10 seconds

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const isActive = (status: Decimal | number | null) => {
    if (status instanceof Decimal) {
      return status.toNumber() === 0;
    }
    if (typeof status === "number") {
      return status === 0;
    }
    return false;
  };

  const options = {
    animation: {
      duration: 0,
    },
    // other chart options
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      <link
        href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
        rel="stylesheet"
      />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-lg md:text-xl">
            Fire Alarm Dashboard
          </h1>
        </div>
        <div className="grid gap-6">
          <Card>
            {recentData[0]?.flame_status?.equals(0) ? (
              <CardHeader className=" text-white">
                <CardTitle>Fire Incident Detected!</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <FlameIcon className="h-5 w-5 text-white" />
                  <span>Fire detected</span>
                </CardDescription>
              </CardHeader>
            ) : (
              <CardHeader className={"bg-green-500 text-white"}>
                <CardTitle>Everything is normal. No fire detected.</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4" />
                  <span>Resolved</span>
                </CardDescription>
              </CardHeader>
            )}
            <CardContent className="p-4 sm:p-6">
              <div className="grid gap-4">
                <div>
                  <h3 className="text-xl font-medium">Smoke Sensor Data</h3>
                </div>
                <div className="mt-3" key={recentData[0]?.id}>
                  <h3 className="text-2xl font-medium">
                    Current Smoke Sensor Reading
                  </h3>
                  <Line ref={chartRef} data={data} options={options} />
                  <div className="flex items-center gap-2">
                    <div className="text-4xl font-bold">
                      {recentData[0]?.mq2_value?.toString() ||
                        "No data available"}
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-medium">Volume Control</h3>
                  <div className="flex items-center gap-2">
                    <Slider
                      id="volume"
                      min={0}
                      max={65535}
                      defaultValue={[30000]} // Provide a default value of 0 if the buzzer_value is undefined
                      className="flex-1"
                      onValueChange={handleVolumeChange} // Update state on slider change
                    />
                    <Button type="button" onClick={handleSubmit}>
                      Submit
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-medium">Sensor Data</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>MQ2 Value</TableHead>
                        <TableHead>Flame Status</TableHead>
                        <TableHead>RGB</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Delete</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sensorData && sensorData.length > 0 ? (
                        sensorData
                          .slice()
                          .filter((data) => data.id !== null) // Filter out null ids
                          .sort((a, b) => (a.id as number) - (b.id as number)) // Type assertion to number
                          .map((data) => (
                            <TableRow key={data?.id}>
                              <TableCell>{data.id}</TableCell>
                              <TableCell>
                                {data?.mq2_value?.toString()}
                              </TableCell>
                              <TableCell>
                                {isActive(data?.flame_status) ? (
                                  <div className="flex items-center gap-2 text-red-500">
                                    <FlameIcon className="h-4 w-4" />
                                    <span>Active</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-green-500">
                                    <CheckIcon className="h-4 w-4" />
                                    <span>Resolved</span>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>{data?.rgb_status}</TableCell>
                              <TableCell>
                                {data?.date
                                  ? new Date(data.date).toLocaleDateString(
                                      "th-TH",
                                      {
                                        timeZone: "Asia/Bangkok",
                                      }
                                    )
                                  : ""}
                                {"    "}
                                {data?.time
                                  ? new Date(data.time).toLocaleTimeString(
                                      "th-TH",
                                      {
                                        timeZone: "Asia/Bangkok",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        second: "2-digit",
                                      }
                                    )
                                  : ""}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-500"
                                  onClick={() => handleDel(data.id)}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="py-2 px-4 border-b">
                            No data available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function CheckIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function FlameIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

function TrashIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
