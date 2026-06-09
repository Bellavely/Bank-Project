import * as dal from "../../dal";
import { TransactionStatus } from "../../prisma/generated/client/client";

export const getAllTransactionsByUser = (
  userId: string,
  page: number,
  limit: number,
  status?: TransactionStatus | undefined,
) => dal.getTransactionsByUser(userId, page, limit, status);
