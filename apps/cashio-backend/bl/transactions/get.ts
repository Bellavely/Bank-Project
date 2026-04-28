import * as dal from "../../dal";
export const getAllTransactionsByUser = (
  userId: number,
  page: number,
  limit: number,
) => dal.getTransactionsByUser(userId, page, limit);
