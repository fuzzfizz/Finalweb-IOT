import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function dbConnect(): Promise<PrismaClient> {
  try {
    // Connect to the database
    await prisma.$connect();
    console.log("Connected to the database");

    return prisma; // Return the Prisma client connection
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    throw error; // Rethrow the error to notify the calling function of the failure
  }
}

export default dbConnect;
