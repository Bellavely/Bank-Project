import { Response, Request, NextFunction } from "express";
import * as bl from "../../bl";
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
  try {
    const { email, password, fullname, phone, validatePassword } =
      validateRegister.parse(req.body);
    res.send(
      await bl.registerUser(
        { email, password, fullname, phone },
        validatePassword,
      ),
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
    if (!token) {
      res.status(403).send("user is not logged in");
    }
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

export const logOut = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = (req as any).user;
    await bl.logOut(userId);
    res.status(200).json("user logged out");
  } catch (error) {
    next(error);
  }
};
