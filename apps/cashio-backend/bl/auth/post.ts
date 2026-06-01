import * as bcrypt from "bcryptjs";
import { User } from "../../types";
import { generateTokens, generateOTP, sendMail } from "../../utils";
import * as dal from "../../dal";
import jwt from "jsonwebtoken";

export const loginUser = async (userEmail: string, userPassword: string) => {
  const user = await dal.getUserByEmail(userEmail);
  if (!user) {
    throw new Error("User not found");
  }
  const isPasswordValid = await bcrypt.compare(userPassword, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }
  const { refreshToken, accessToken } = generateTokens(user);
  await dal.addRefreshToken(user._id, refreshToken);

  return { refreshToken, accessToken };
};

export const registerUser = async (
  {
    email,
    password,
    fullname,
    phone,
  }: Pick<User, "fullname" | "password" | "email" | "phone">,
  validatePassword: string,
) => {
  if (password !== validatePassword) {
    throw new Error("check your password again");
  }
  const existingUser = await dal.getUserByEmail(email);
  if (existingUser) {
    throw new Error("user is already exists");
  }
  const hashGivenPassword = await bcrypt.hash(password, 10);
  const userOTP = generateOTP();
  await dal.register({
    email,
    password: hashGivenPassword,
    fullname,
    phone,
    otp: userOTP,
  });

  await sendMail(email, userOTP);

  return {
    message: "Register successful. Please check your email for the OTP.",
  };
};

export const refreshToken = async (refreshToken: string) => {
  const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET!);
  if (typeof payload === "string") {
    throw new Error("Invalid token");
  }
  const { userId } = payload;
  const storedRefreshToken = await dal.getRefreshTokenByUserId(userId);
  if (!storedRefreshToken || storedRefreshToken.refreshToken !== refreshToken) {
    throw new Error("Invalid token");
  }
  const user = await dal.getUserById(userId);
  if (!user) {
    throw new Error("user is not exist");
  }
  const { refreshToken: newRefreshToken, accessToken } = generateTokens(user);

  await dal.UpdateToken(user._id, newRefreshToken);
  return { refreshToken: newRefreshToken, accessToken };
};

export const verifyOtp = async (email: string, userOtp: number) => {
  const user = await dal.getUserByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }
  if (user.otp !== userOtp) {
    throw new Error("invalid otp");
  }

  await dal.verifyUser(user._id);

  const { refreshToken, accessToken } = generateTokens(user);
  await dal.addRefreshToken(user._id, refreshToken);

  return { refreshToken, accessToken, message: "otp verified" };
};

export const resendOtp = async (email: string) => {
  const user = await dal.getUserByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }
  const newOtp = generateOTP();
  await dal.updateUserOtp(email, newOtp);
  await sendMail(email, newOtp);

  return { message: "A new OTP has been sent to your email." };
};

export const logOut = (userId: string) => dal.logOut(userId);