import express from "express";
import { getBalance } from "./get";
import {authMiddleWare} from "../../middleware";

export const walletRoute = express.Router();

walletRoute.get("/myBalance", authMiddleWare, getBalance);