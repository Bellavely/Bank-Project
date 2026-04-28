import { User } from "libs/shared/types";
import { users, wallets } from "../consts";
import { getRandomInt } from "apps/cashio-backend/utils";

export const register = ({
  fullname,
  password,
  email,
  phone,
}: Pick<User,'fullname'|'password'|'email'|'phone'>) => {
  const id = users.length;
  wallets.push({ userId: id, balance: getRandomInt(1000000, 100) });
  users.push({
    id,
    fullname,
    email,
    password,
    phone,
  });
  return id;
};
