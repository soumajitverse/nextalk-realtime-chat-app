import "dotenv/config";
import express, { Request, Response } from "express";
import { redisClient } from "./config/redis.js";
import { prisma } from "../lib/prisma.js";
import userRouter from "./routes/user.route.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";

const app = express();

const port = process.env.PORT || 3000;

app.use("/api/v1/user", userRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Server is Live!");
});

export async function dbConnect() {
  try {
    await prisma.$connect();
    console.log("✅ Prisma connected to DB");
  } catch (err) {
    console.error("❌ DB connection failed", err);
    process.exit(1); // stop app if DB is not available
  }
}
dbConnect();
connectRabbitMQ()
redisClient.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
