import * as dal from "../../dal";
import { TransactionStatus } from "../../prisma/generated/client/client";
import { AppError } from "apps/cashio-backend/utils";
import { StatusCodes } from "http-status-codes";

export const createTransaction = async (
  senderId: string,
  message: string,
  receiverEmail: string,
  amount: number,
) => {
  const receiver = await dal.getUserByEmail(receiverEmail);
  if (!receiver) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      `משתמש עם האימייל ${receiverEmail} לא נמצא`,
    );
  }
  const senderBalance = await dal.getBalance(senderId);
  if (!senderBalance) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      `יתרה של המשתמש ${senderId} לא נמצאה`,
    );
  }
  if (!senderBalance.balance || amount > senderBalance.balance) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "לא ניתן לבצע את ההעברה היתרה נמוכה מידי",
    );
  }

  const transaction = await dal.createTransaction({
    reciverId: receiver.id,
    senderId,
    amount,
    message,
    status: TransactionStatus.PENDING,
  });
  console.log(transaction);

  return { message: `ההעברה בוצעה`, transactionId: transaction._id };
};

export const acceptTransaction = async (trasactionId: string) =>
  await dal.transferMoney(trasactionId);

export const rejectTransaction = async (transactionId: string) =>
  await dal.updateTransaction(transactionId, TransactionStatus.FAILED);
