import { User } from "../../types";
import { getRandomInt } from "../../utils";
import { prisma } from "../../prisma/prismaClient";

export const register = async ({
  fullName,
  password,
  email,
  phone,
  otp,
}: Pick<User, "fullName" | "password" | "email" | "phone"> & {
  otp: number;
}) => {
  const newUser = await prisma.user.create({
    data: {
      fullName,
      password,
      email,
      phone,
      otpCode: otp.toString(),
    },
  });

  await prisma.wallet.create({
    data: {
      userId: newUser.id,
      balance: getRandomInt(10000, 100).toString(),
    },
  });
};

export const verifyUser = async (userId: string) => {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isVerified: true,
      otpCode: null,
    },
  });
};

export const updateUserOtp = async (email: string, otp: number) => {
  await prisma.user.update({
    where: {
      email,
    },
    data: {
      otpCode: otp.toString(),
    },
  });
};
