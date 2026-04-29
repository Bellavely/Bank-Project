import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import { authRoute } from "./api/auth";
import { errorHandler } from "./middleware";
import { userRoute } from "./api/users";
import { walletRoute } from "./api/wallet/routes";
import { transactionRoute } from "./api/transactions/routes";
import { connectDb } from "./mongoDb";

dotenv.config();

connectDb();
const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT,
    credentials: true,
  }),
);

app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/wallet", walletRoute);
app.use("/transactions", transactionRoute);

app.use(errorHandler);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

app.get("/healthCheck", (req, res) => {
  res.send("Server is healthy :)");
});
