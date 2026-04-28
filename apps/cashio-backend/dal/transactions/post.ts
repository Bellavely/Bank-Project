import { getUserByEmail } from "../users";
import { getBalance, updateUsersBalance } from "../wallet";

export const transferMoney = async (
  senderId: number,
  reciverEmail: string,
  amount: number,
) => {
  const reciver = await getUserByEmail(reciverEmail);
  if (!reciver) {
    throw new Error("המייל לא קיים");
  }
  const senderBalance = getBalance(senderId);
  if (!senderBalance) {
    throw new Error("לא קיים לקוח או יש תקלה בארנק של הלקוח");
  }
  if (amount > senderBalance) {
    throw new Error("לא ניתן לבצע את ההעברה היתרה נמוכה מידי");
  }

  updateUsersBalance(senderId, -amount);
  updateUsersBalance(reciver.id, amount);
  return { message: `ההעברה בוצעה` };
};
