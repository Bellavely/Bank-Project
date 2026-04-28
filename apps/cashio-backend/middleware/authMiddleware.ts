import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleWare = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).send({ message: "no token provided" });
    }
    const token = authHeader?.split(" ")[1];
    if (!token) {
      res.status(401).send({ message: "invalid token pormat" });
    }
    const decode = jwt.verify(token!, process.env.ACCESS_SECRET!);
    if (typeof decode === "string") {
      res.status(401).send({ message: "invalid token pormat" });
    }
    (req as any).user = decode;
    next();
  } catch (err) {
    res.status(401).send({ message: `token is expired or not valid + ${err}` });
  }
};
