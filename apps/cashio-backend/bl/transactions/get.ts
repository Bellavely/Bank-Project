import { TransactionStatus } from "../../types";
import * as dal from "../../dal";
export const getAllTransactionsByUser = (
  userId: string,
  page: number,
  limit: number,
  status?: TransactionStatus,
) => dal.getTransactionsByUser(userId, page, limit, status);
