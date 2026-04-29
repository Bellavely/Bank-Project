import express from "express";
import { getUserById } from "./get";
export const userRoute = express.Router();

userRoute.get("/me", getUserById);
