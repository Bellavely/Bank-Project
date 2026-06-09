import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware";
import { appRoute } from "./routes";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      const allowedOrigins = [process.env.CLIENT];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use(appRoute);

app.use(errorHandler);

app.listen(Number(process.env.PORT), process.env.HOST, () => {
  console.log("Server is running on port 3000");
});

app.get("/healthCheck", (req, res) => {
  res.send("Server is healthy :)");
});
