import express from "express";
import {
  getAllUsers,
  loginUser,
  myProfile,
  updateProfile,
  verifyUser,
} from "../controllers/user.js";
import isUserAuth from "../middleware/user.auth.js";
const userRouter = express.Router();

userRouter.post("/login", loginUser);
userRouter.post("/verify", verifyUser);
userRouter.get("/me", isUserAuth, myProfile);
userRouter.put("/updateProfile", isUserAuth, updateProfile);
userRouter.get("/allUsers", isUserAuth, getAllUsers);

export default userRouter;
