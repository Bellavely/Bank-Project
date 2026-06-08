import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
export const authMiddleWare = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if (!authHeader) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send({ message: "no token provided" });
    }
    const token = authHeader?.split(" ")[1];
    if (!token) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send({ message: "invalid token pormat" });
    }
    const decode = jwt.verify(token!, process.env.ACCESS_SECRET!);
    if (typeof decode === "string") {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send({ message: "invalid token pormat" });
    }
    (req as any).user = decode;
    next();
  } catch (err) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send({ message: `token is expired or not valid + ${err}` });
  }
};
