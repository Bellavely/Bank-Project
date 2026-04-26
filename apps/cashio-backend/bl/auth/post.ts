import * as bycrypt from "bcryptjs";
import { getUserByEmail, register } from "../../dal/users";
import { Response, Request, NextFunction } from "express";
import { User } from "libs/shared/types";

//add validations for my inputs check if i can use zod for that
export const loginUser = async (userEmail: string, userPassword: string) => {
  const user = await getUserByEmail(userEmail);
  if (!user) {
    throw new Error("User not found");
  }
  const hashGivenPassword = await bycrypt.hash(userPassword, 10);
  const isPasswordValid = await bycrypt.compare(
    hashGivenPassword,
    user.password,
  );
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }
  return { message: "Login successful", userId: user.id };
};

export const registerUser = async ({
  email,
  password,
  fullName,
  phoneNumber,
}: User) => {
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error("user is already exists");
  }
  const hashGivenPassword = await bycrypt.hash(password, 10);

  return {
    message: "Login successful",
    userId: register({
      email,
      password: hashGivenPassword,
      fullName,
      phoneNumber,
    }),
  };
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.send("refresh token logic");
};
