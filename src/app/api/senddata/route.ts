import prisma from "@/libs/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // ตรวจสอบข้อมูลที่ส่งเข้ามา
    if (
      typeof data.analog1 !== "number" ||
      typeof data.analog2 !== "number" ||
      typeof data.digital1 !== "boolean" ||
      typeof data.digital2 !== "boolean"
    ) {
      return NextResponse.json({
        error: "Invalid data format",
        status: 400,
      });
    }
    // สร้างข้อมูลใหม่ในฐานข้อมูล
    const result = await prisma.aTH034.create({
      data: {
        analog1: data.analog1,
        analog2: data.analog2,
        digital1: data.digital1,
        digital2: data.digital2,
      },
    });

    return NextResponse.json({
      result,
      message: "Data created successfully",
      status: 200,
    });
  } catch (error) {
    console.error("Error creating data:", error);

    return NextResponse.json({
      error: "Failed to create data",
      status: 500,
    });
  }
}
