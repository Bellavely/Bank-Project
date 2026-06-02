import express from "express";
import { chatHandler } from "./post";
import { authMiddleWare } from "apps/cashio-backend/middleware";

export const chatRoute = express.Router();

chatRoute.post('', authMiddleWare, chatHandler);
