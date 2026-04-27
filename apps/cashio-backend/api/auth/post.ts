import { Response, Request, NextFunction } from "express";
import * as bl from "../../bl";
import { generateTokens } from "../../utils";
import { validateLogin, validateRegister } from "../../validation";
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = validateLogin.parse(req.body);
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
  const { email, password, fullname, phoneNumber } = validateRegister.parse(
    req.body,
  );
  try {
    res.send(
      await bl.registerUser({ email, password, fullname, phone: phoneNumber }),
    );
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
