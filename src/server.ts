import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import next from "next";
import { PrismaClient } from "@prisma/client"; // เชื่อมต่อ Prisma กับฐานข้อมูล PostgreSQL

const prisma = new PrismaClient(); // สร้าง instance ของ PrismaClient
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new SocketIOServer(server, {
    cors: {
      origin: "*", // กำหนดให้อนุญาตให้ทำการร้องขอจาก localhost:3000
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected");

    // ส่งข้อมูล weatherforecast ไปยัง client เมื่อมีการเชื่อมต่อใหม่
    const interval = setInterval(async () => {
      const latest = await prisma.aTH034.findFirst({
        orderBy: { date_time: "desc" },
      });

      const result = await prisma.aTH034.findMany({});

      // ส่งข้อมูลไปยัง client
      socket.emit("recentUpdate", latest);
      socket.emit("allUpdate", result);
    }, 1000);

    socket.on("disconnect", () => {
      console.log("Client disconnected");
      clearInterval(interval);
    });
  });

  server.listen(5000, () => {
    console.log("Server is running on http://localhost:5000");
  });
});
