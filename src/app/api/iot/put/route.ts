import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
export const dynamic = "force-dynamic";
export async function PUT(req: Request) {
  try {
    // Update the buzzer value by requesting the body from the request
    const { buz } = await req.json();
    const result = await prisma.aTH034.update({
      where: {
        id: 10,
      },
      data: {
        buzzer_value: buz,
      },
      select: {
        buzzer_value: true,
      },
    });

    return new Response(
      JSON.stringify({ buzzer_value: result?.buzzer_value }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching buzzer value:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
