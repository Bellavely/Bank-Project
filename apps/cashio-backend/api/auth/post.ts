import { Response, Request, NextFunction } from "express";
import { loginUser, registerUser } from "../../bl";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body;
  try {
    res.send(await loginUser(email, password));
  } catch (error) {
    next(error);
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password, fullName, phoneNumber } = req.body;
  try {
    res.send(await registerUser({ email, password, fullName, phoneNumber }));
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.send("Refresh token route");
};
