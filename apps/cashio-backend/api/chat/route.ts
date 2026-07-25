import express from "express";
import { chatHandler, translateHistory } from "./post";
import { authMiddleWare } from "../../middleware";

export const chatRoute = express.Router();

chatRoute.post("", authMiddleWare, chatHandler);
chatRoute.post("/translate", authMiddleWare, translateHistory);
