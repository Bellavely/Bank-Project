import { User } from "libs/shared/types";
import { refreshTokens, users, wallets } from "../consts";
import { getRandomInt } from "apps/cashio-backend/utils";

export const register = ({
  fullname: fullName,
  password,
  email,
  phone: phoneNumber,
}: User) => {
  const id = users.length;
  wallets.push({ userId: id, balance: getRandomInt(1000000, 100) });
  users.push({
    id,
    fullname: fullName,
    email,
    password,
    phone: phoneNumber,
  });
  return id;
};
