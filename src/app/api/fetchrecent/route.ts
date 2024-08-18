import prisma from "@/libs/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: Request, res: Response) {
  try {
    const result = await prisma.aTH034.findMany({
      orderBy: {
        date_time: "desc",
      },
      take: 1,
    });
    return NextResponse.json({
      result,
      message: "IOT fetched successfully",
      status: 200,
    });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to fetch IOT",
      status: 500,
    });
  }
}
