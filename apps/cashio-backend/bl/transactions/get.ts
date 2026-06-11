import * as dal from "../../dal";
import { TransactionStatus } from "@prisma/client";

export const getAllTransactionsByUser = (
  userId: string,
  page: number,
  limit: number,
  status?: TransactionStatus | undefined,
) => dal.getTransactionsByUser(userId, page, limit, status);
