import { Response, Request, NextFunction } from "express";
import * as bl from "../../bl";
import { generateTokens } from "../../utils";
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body;
  try {
    const { refreshToken, accessToken } = await bl.loginUser(email, password);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    res.status(200).json(accessToken);
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
    res.send(await bl.registerUser({ email, password, fullName, phoneNumber }));
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.refreshToken;
    const { refreshToken, accessToken } = await bl.refreshToken(token);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    res.status(200).json(accessToken);
  } catch (error) {
    next(error);
  }
};
