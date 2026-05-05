import { authMiddleWare } from "../../middleware";
import express from "express";
import { getAllTransactionsByUser } from "./get";
import {
  acceptTransactoin,
  createTransaction,
  rejectTransactoin,
} from "./post";

export const transactionRoute = express.Router();
transactionRoute.get("/all", authMiddleWare, getAllTransactionsByUser);
transactionRoute.post("/send", authMiddleWare, createTransaction);
transactionRoute.patch("/:id/accept", authMiddleWare, acceptTransactoin);
transactionRoute.patch("/:id/reject", authMiddleWare, rejectTransactoin);
