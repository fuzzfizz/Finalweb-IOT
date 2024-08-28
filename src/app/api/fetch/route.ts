import prisma from "@/libs/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: Request, res: Response) {
  try {
    const result = await prisma.aTH034.findMany({});
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to fetch IOT",
      status: 500,
    });
  }
}
