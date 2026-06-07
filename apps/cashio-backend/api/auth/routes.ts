import express from "express";
import { login, refreshToken, register, verifyOTP, resendOTP } from "./post";
import { logOut } from "./delete";
import { authMiddleWare } from "../../middleware";
export const authRoute = express.Router();

authRoute.post("/login", login);
authRoute.post("/register", register);
authRoute.delete("/logout", authMiddleWare, logOut);
authRoute.post("/refresh", refreshToken);
authRoute.post("/verifyOTP", verifyOTP);
authRoute.post("/resendOTP", resendOTP);
