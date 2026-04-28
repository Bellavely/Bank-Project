import * as dal from "../../dal";
export const transferMoney = async (
  senderId: number,
  message: string,
  receiverEmail: string,
  amount: number,
) => {
  const receiver = await dal.getUserByEmail(receiverEmail);
  if (!receiver) {
    throw new Error("המייל לא קיים");
  }
  const senderBalance = dal.getBalance(senderId);
  if (!senderBalance) {
    throw new Error("לא קיים לקוח או יש תקלה בארנק של הלקוח");
  }
  if (amount > senderBalance) {
    throw new Error("לא ניתן לבצע את ההעברה היתרה נמוכה מידי");
  }

  dal.updateUsersBalance(senderId, -amount);
  dal.updateUsersBalance(receiver.id, amount);
  dal.createTransaction({
    receiverId: receiver.id,
    senderId,
    amount,
    createdAt: new Date().toISOString(),
    message,
  });
  return { message: `ההעברה בוצעה` };
};
