import express from "express";
import { getUserById } from "./get";
import { authMiddleWare } from "../../middleware";

export const userRoute = express.Router();

userRoute.get("/me", authMiddleWare, getUserById);
