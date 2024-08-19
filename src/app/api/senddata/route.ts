import prisma from "@/libs/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const data = await req.json();

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
    return NextResponse.json({
      error: "Failed to create data",
      status: 500,
    });
  }
}
