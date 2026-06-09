import express from "express";
import { chatHandler } from "./post";
import { authMiddleWare } from "../../middleware";

export const chatRoute = express.Router();

chatRoute.post("", authMiddleWare, chatHandler);
