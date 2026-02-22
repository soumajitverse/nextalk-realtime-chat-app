import "dotenv/config";
import express, { Request, Response } from "express";

import { redisClient } from "./config/redis.js";
import { prisma } from "../lib/prisma.js";
import userRouter from "./routes/user.route.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import cors from "cors";

const app = express();

app.use(express.json()); //is an Express middleware that parses incoming requests with JSON payloads and makes the data available in req.body.

const port = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:5173",
  process.env.ALLOWED_ORIGIN || "http://localhost:5173",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // permit to flow cookie from client to server and vice-versa
  }),
);

app.use("/api/v1/user", userRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("User service is Live!");
});

export async function dbConnect() {
  try {
    await prisma.$connect();
    console.log("✅ Prisma connected to PostgresSql DB");
  } catch (err) {
    console.error("❌ DB connection failed", err);
    process.exit(1); // stop app if DB is not available
  }
}
dbConnect();
connectRabbitMQ();
redisClient.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
