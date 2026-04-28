import express from "express";
import { authRoute, transactionRoute, userRoute, walletRoute } from "./api";
export const appRoute = express.Router();
appRoute.use("/auth", authRoute);
appRoute.use("/users", userRoute);
appRoute.use("/wallet", walletRoute);
appRoute.use("/transactions", transactionRoute);