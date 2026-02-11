import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL ?? "";
if (!url) {
  throw new Error("DATABASE_URL is required");
}

const adapter = new PrismaPg({
  connectionString: url,
  ssl: { rejectUnauthorized: false }
});

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
});

export default prisma;
