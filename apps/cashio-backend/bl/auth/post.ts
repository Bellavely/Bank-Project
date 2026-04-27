import * as bcrypt from "bcryptjs";
import { User } from "libs/shared/types";
import { generateTokens } from "../../utils";
import * as dal from "../../dal";
import jwt from "jsonwebtoken";

//add validations for my inputs check if i can use zod for that
export const loginUser = async (userEmail: string, userPassword: string) => {
  const user = await dal.getUserByEmail(userEmail);
  if (!user) {
    throw new Error("User not found");
  }
  const isPasswordValid = await bcrypt.compare(userPassword, user.password);
  const isPasswordValid = await bcrypt.compare(userPassword, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }
  const { refreshToken, accessToken } = generateTokens(user);
  dal.addRefreshToken(user.id!!, refreshToken);

  return { refreshToken, accessToken };
};

export const registerUser = async ({
  email,
  password,
  fullname: fullName,
  phone: phoneNumber,
}: User) => {
  const existingUser = await dal.getUserByEmail(email);
  if (existingUser) {
    throw new Error("user is already exists");
  }
  const hashGivenPassword = await bcrypt.hash(password, 10);
  dal.register({
    email,
    password: hashGivenPassword,
    fullname: fullName,
    phone: phoneNumber,
  });
  return {
    message: "Register successful",
  };
};

export const refreshToken = async (refreshToken: string) => {
  const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET!);
  if (typeof payload === "string") {
    throw new Error("Invalid token");
  }
  const { userId } = payload;
  const storedRefreshToken = dal.getRefreshTokenByUserId(userId);

  if (storedRefreshToken !== refreshToken) {
    throw new Error("Invalid token send token is not the stored one");
  }
  const user = await dal.getUserById(userId);
  if (!user) {
    throw new Error("user is not exist");
  }
  const { refreshToken: newRefreshToken, accessToken } = generateTokens(user!);

  dal.UpdateToken(user?.id!, newRefreshToken);
  return { refreshToken: newRefreshToken, accessToken };
};
