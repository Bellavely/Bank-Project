import { User } from "../../types";
import { getRandomInt } from "../../utils";
import { userCollection } from "../../models";
import { walletCollection } from "../../models";

export const register = async ({
  fullname,
  password,
  email,
  phone,
  otp,
}: Pick<User, "fullname" | "password" | "email" | "phone"> & { otp: number }) => {
  const newUser = await userCollection.create({
    fullname,
    password,
    email,
    phone,
    otp,
  });

  await walletCollection.create({
    userId: newUser._id,
    balance: getRandomInt(10000, 100),
  });
};

export const verifyUser = async (userId: string) => {
  await userCollection.findByIdAndUpdate(userId, { isVerified: true, otp: null });
};

