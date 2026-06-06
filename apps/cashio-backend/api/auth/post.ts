import { Response, Request, NextFunction } from "express";
import * as bl from "../../bl";
import { validateLogin, validateRegister } from "../../validation";
import { StatusCodes } from "http-status-codes";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = validateLogin.parse(req.body);
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
        { email, password, fullName: fullname, phone },
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
      return res.status(StatusCodes.FORBIDDEN).send("user is not logged in");
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

export const verifyOTP = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, userOTP } = req.body;
    const { refreshToken, accessToken } = await bl.verifyOtp(
      email,
      Number(userOTP),
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.status(StatusCodes.OK).json(accessToken);
  } catch (error) {
    next(error);
  }
};

export const resendOTP = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;
    res.status(StatusCodes.OK).json(await bl.resendOtp(email));
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
    res.status(StatusCodes.OK).json("user logged out");
  } catch (error) {
    next(error);
  }
};
