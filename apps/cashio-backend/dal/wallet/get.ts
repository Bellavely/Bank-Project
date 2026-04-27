import { wallets } from "../consts";

export const getBalance = (userId: number) => {
  return wallets.find((value) => value.userId === userId)?.balance;
};
