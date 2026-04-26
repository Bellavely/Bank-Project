import express from "express";
import { authRoute, login } from "./api/auth";
import { errorHandler } from "./middleware";

const app = express();
app.use(express.json());

app.use("/auth", authRoute);
app.use(errorHandler);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

app.get("/healthCheck", (req, res) => {
  res.send("Server is healthy :)");
});
