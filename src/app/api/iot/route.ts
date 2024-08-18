import prisma from "@/libs/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: Request, res: Response) {
  try {
    const result = await prisma.aTH034.findMany({});
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
// ----------------------------------------------------------------------------------------------------------------
export async function POST(req: Request, res: Response) {
  try {
    const result = await prisma.aTH034.findMany({});
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
// ----------------------------------------------------------------------------------------------------------------
//Delete by รับค่า id จาก body แล้วลบข้อมูลใน database ที่มี id ตรงกับค่าที่รับมา
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    const result = await prisma.aTH034.delete({
      where: {
        id: parseInt(id),
      },
    });
    return NextResponse.json({
      result,
      message: "IOT deleted successfully",
      status: 200,
    });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to delete IOT",
      status: 500,
    });
  }
}
