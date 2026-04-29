import { User } from "../../types";
import { getRandomInt } from "../../utils";
import { userCollection } from "../../models";
import { walletCollection } from "../../models";

export const register = async ({
  fullname,
  password,
  email,
  phone,
}: Pick<User, "fullname" | "password" | "email" | "phone">) => {
  const newUser = await userCollection.create({
    fullname,
    password,
    email,
    phone,
  });
  await walletCollection.create({
    userId: newUser._id,
    balance: getRandomInt(10000, 100),
  });
};
