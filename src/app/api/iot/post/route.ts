import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  try {
    const { flame, gas, rgb } = await req.json();

    // Validate inputs
    if (
      typeof flame !== "string" ||
      typeof gas !== "string" ||
      typeof rgb !== "string"
    ) {
      return new Response(JSON.stringify({ error: "Invalid input data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save the data to the database
    await prisma.aTH034.create({
      data: {
        flame_status: flame,
        mq2_value: parseFloat(gas), // Convert gas to decimal
        rgb_status: rgb,
      },
    });

    return new Response(
      JSON.stringify({ message: "Data saved successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error saving data:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
