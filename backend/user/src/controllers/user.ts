import { Request, Response } from "express";
import { redisClient } from "../config/redis.js";
import { publishToQueue } from "../config/rabbitmq.js";
import { prisma } from "../../lib/prisma.js";
import generateToken from "../config/token.js";

interface User {
  id: number;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // rate limit for otp
    const rateLimitkey = `otp:ratelimit:${email}`;
    const rateLimit = await redisClient.get(rateLimitkey);
    if (rateLimit) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please wait before requesting new OTP",
      });
    }

    // if rate limit key is not in redis then it will generate a 6 digit otp
    const otp = Math.floor(100000 + Math.random() * 900000);

    const otpKey = `otp:${email}`;

    // set the otp in the redis with the expiary of 5 min
    await redisClient.set(otpKey, otp, "EX", 300);

    // set the rate limit key in the redis for 1 min
    await redisClient.set(rateLimitkey, "true", "EX", 60);

    const message = {
      to: email,
      subject: "Your otp code for Nextalk",
      body: `your OTP is ${otp}. It is valid for 5 minutes.`,
    };

    await publishToQueue("send-otp", message);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your mail.",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyUser = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP Required",
      });
    }
    const otpKey = `otp:${email}`;
    const storedOtp = await redisClient.get(otpKey);

    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    await redisClient.del(otpKey); // delete the otp key from redis if the enetered otp is correct

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // if user is not present in the db
    if (!user) {
      const name = email.slice(0, 8);

      const user: User = await prisma.user.create({
        data: {
          email,
          name,
        },
      });

      let token = generateToken(user.id); // generating token
      console.log("Token is ", token);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENVIRONMENT === "production",
        sameSite:
          process.env.NODE_ENVIRONMENT === "production" ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        success: true,
        message: "User verfied",
        token,
      });
    }

    let token = generateToken(user.id); // generating token
    console.log("Token is ", token);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENVIRONMENT === "production",
      sameSite:
        process.env.NODE_ENVIRONMENT === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "User verfied",
      // token,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const myProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "User is authorised",
      data: user,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name } = req.body;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: updatedUser,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!users) {
      return res.status(404).json({
        success: false,
        message: "Users not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Fetched all users.",
      data: users,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
