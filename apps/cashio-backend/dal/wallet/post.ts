import { walletCollection } from "../../models";

export const updateUsersBalance = async (userId: string, amount: number) => {
  await walletCollection.updateOne(
    { userId, balance: { $gte: amount } },
    { $inc: { balance: amount } },
  );
};
