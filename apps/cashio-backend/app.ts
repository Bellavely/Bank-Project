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
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {

      const allowedOrigins = [process.env.CLIENT, "http://localhost:5173", "http://127.0.0.1:5173"];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Fallback for various local dev environments
      }
    },
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
