import "dotenv/config";
import { Redis } from "ioredis";

const Host: any =
  process.env.NODE_ENVIRONMENT === "production" ? "todo_redis" : "localhost";
const Port: number = Number(process.env.REDIS_PORT);
export const redisClient = new Redis({
  host: Host || "localhost",
  port: Port || 6379,
});
// console.log(Host);
// console.log(Number(process.env.REDIS_PORT));