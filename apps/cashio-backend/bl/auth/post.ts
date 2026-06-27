import * as bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User } from "../../types";
import { generateTokens, generateOTP, sendMail, AppError } from "../../utils";
import * as dal from "../../dal";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";

dotenv.config();

export const loginUser = async (userEmail: string, userPassword: string) => {
  const user = await dal.getUserByEmail(userEmail);
  if (!user) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      `משתמש עם האימייל ${userEmail} לא נמצא`,
    );
  }
  if (!user.isVerified) {
    throw new AppError(StatusCodes.FORBIDDEN, `יש לוודא שמייל תקין`);
  }
  const isPasswordValid = await bcrypt.compare(userPassword, user.password);
  if (!isPasswordValid) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "סיסמה שגויה");
  }
  const { refreshToken, accessToken } = generateTokens(user);
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7);
  await dal.addRefreshToken(user.id, refreshToken, expirationDate);

  return { refreshToken, accessToken };
};

export const registerUser = async (
  {
    email,
    password,
    fullName,
    phone,
  }: Pick<User, "fullName" | "password" | "email" | "phone">,
  validatePassword: string,
) => {
  if (password !== validatePassword) {
    throw new AppError(StatusCodes.BAD_REQUEST, "הסיסמאות לא תואמות");
  }
  const existingUser = await dal.getUserByEmail(email);
  if (existingUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "משתמש עם האימייל זה כבר רשום");
  }
  const hashGivenPassword = await bcrypt.hash(password, 10);
  const userOTP = generateOTP();
  await dal.register({
    email,
    password: hashGivenPassword,
    fullName,
    phone,
    otp: userOTP,
  });

  await sendMail({ to: email, otp: userOTP });

  return {
    message: "Register successful. Please check your email for the OTP.",
  };
};

export const refreshToken = async (refreshToken: string) => {
  const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET!);
  if (typeof payload === "string") {
    throw new AppError(StatusCodes.UNAUTHORIZED, "טוקן לא חוקי");
  }
  const { userId } = payload;
  const storedRefreshToken = await dal.getRefreshTokenByUserId(userId);
  if (!storedRefreshToken || storedRefreshToken.refreshToken !== refreshToken) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "המשתמש לא מחובר");
  }
  const user = await dal.getUserById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "משתמש לא קיים");
  }
  const { refreshToken: newRefreshToken, accessToken } = generateTokens(user);

  await dal.UpdateToken(user.id, newRefreshToken);
  return { refreshToken: newRefreshToken, accessToken };
};

export const verifyOtp = async (email: string, userOtp: number) => {
  const user = await dal.getUserByEmail(email);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "משתמש לא נמצא");
  }
  if (user.otpCode && user.otpCode !== userOtp.toString()) {
    throw new AppError(StatusCodes.BAD_REQUEST, "otp לא חוקי");
  }

  await dal.verifyUser(user.id);

  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7);

  const { refreshToken, accessToken } = generateTokens(user);
  await dal.addRefreshToken(user.id, refreshToken, expirationDate);

  return { refreshToken, accessToken, message: "otp verified" };
};

export const resendOtp = async (email: string) => {
  const user = await dal.getUserByEmail(email);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "משתמש לא נמצא");
  }
  const newOtp = generateOTP();
  await dal.updateUserOtp(email, newOtp);
  await sendMail({ to: email, otp: newOtp });

  return { message: "A new OTP has been sent to your email." };
};
