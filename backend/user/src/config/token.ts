import "dotenv/config";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

const generateToken = (user: any): string => {
  const token = jwt.sign({ user }, JWT_SECRET, { expiresIn: "15d" });
  return token;
};

export default generateToken;
