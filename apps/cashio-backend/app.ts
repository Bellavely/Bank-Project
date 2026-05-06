import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware";
import { connectDb } from "./mongoDb";
import { appRoute } from "./routes";

dotenv.config();

connectDb();
const app = express();
app.use(
  cors({
    origin: process.env.CLIENT,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use(appRoute);

app.use(errorHandler);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

app.get("/healthCheck", (req, res) => {
  res.send("Server is healthy :)");
});
