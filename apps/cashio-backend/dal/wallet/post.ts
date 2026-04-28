import { wallets } from "../consts";

export const updateUsersBalance = (userId: number, amount: number) => {
  wallets.map((value) =>
    value.userId === userId ? (value.balance += amount) : value,
  );
};
