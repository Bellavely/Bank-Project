import * as dal from "../../dal";
export const transferMoney = async (
  senderId: number,
  reciverEmail: string,
  amount: number,
) => dal.transferMoney(senderId, reciverEmail, amount);
