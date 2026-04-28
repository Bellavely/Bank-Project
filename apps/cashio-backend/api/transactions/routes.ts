import { authMiddleWare } from "apps/cashio-backend/middleware";
import express from "express";
import { getAllTransactionsByUser } from "./get";
import { transferMoney } from "./post";

export const transactionRoute = express.Router();
transactionRoute.use("/all", authMiddleWare, getAllTransactionsByUser);
transactionRoute.post("/send", authMiddleWare, transferMoney);
