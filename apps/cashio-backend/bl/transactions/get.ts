import * as dal from "../../dal";
export const getAllTransactionsByUser = (
  userId: string,
  page: number,
  limit: number,
  status?: string,
) => dal.getTransactionsByUser(userId, page, limit, status);
