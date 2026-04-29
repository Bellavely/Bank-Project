import { TransactionStatus } from "../../types";
import * as dal from "../../dal";

export const createTransaction = async (
  senderId: string,
  message: string,
  receiverEmail: string,
  amount: number,
) => {
  const receiver = await dal.getUserByEmail(receiverEmail);
  if (!receiver) {
    throw new Error("המייל לא קיים");
  }
  const senderBalance = await dal.getBalance(senderId);
  if (!senderBalance) {
    throw new Error("לא קיים לקוח או יש תקלה בארנק של הלקוח");
  }
  if (amount > senderBalance.balance) {
    throw new Error("לא ניתן לבצע את ההעברה היתרה נמוכה מידי");
  }

  const transaction = await dal.createTransaction({
    receiverId: receiver._id,
    senderId,
    amount,
    message,
    status: TransactionStatus.WAITING,
  });

  return { message: `ההעברה בוצעה`, transactionId: transaction._id };
};

export const acceptTransaction = async (trasactionId: string) =>
  await dal.transferMoney(trasactionId);

export const rejectTransaction = async (transactionId: string) =>
  await dal.updateTransaction(transactionId, TransactionStatus.CANCELED);
