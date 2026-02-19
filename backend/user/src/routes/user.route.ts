import express from "express";
import { loginUser, myProfile, updateName, verifyUser } from "../controllers/user.js";
import isUserAuth from "../middleware/user.auth.js";
const userRouter = express.Router();

userRouter.post("/login", loginUser);
userRouter.post("/verify", verifyUser);
userRouter.get("/me", isUserAuth, myProfile);
userRouter.put("/updateProfile", isUserAuth, updateName);

export default userRouter;
