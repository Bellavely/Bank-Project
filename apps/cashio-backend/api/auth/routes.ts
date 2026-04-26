import express from "express";
import { login, refreshToken, register } from "./post";
export const authRoute = express.Router();

authRoute.post("/login", login);
authRoute.post("/register", register);
authRoute.post("/refresh-token", refreshToken);
