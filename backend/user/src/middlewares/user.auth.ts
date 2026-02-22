import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const isAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // console.log("Cookies: ", req.cookies);
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated.",
      });
    }
    // console.log("authHeader: ", authHeader);
    const token = authHeader.split(" ")[1];

    const JWT_SECRET = process.env.JWT_SECRET as string;
    console.log("jwt secret: ", JWT_SECRET);
    const tokenDecoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // console.log("token decoded: ", tokenDecoded);

    if (!tokenDecoded || !tokenDecoded.user) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated.",
      });
    }

    req.user = tokenDecoded.user;
    next();
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default isAuth;
