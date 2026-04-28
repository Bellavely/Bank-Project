import { transactions } from "../consts";
export const getTransactionsByUser = (
  userId: number,
  page: number,
  limit: number,
) => {
  const start = (page - 1) * limit;
  const end = page * limit;
  const totalPages = Math.ceil(transactions.length / limit);
  if (page > totalPages) {
    throw new Error(`אין טרנזקציות בעמוד ${page}`);
  }
  const data = transactions
    .map((value) => value.senderId === userId || value.receiverId === userId)
    .slice(start, end);

  return { length: transactions.length, data };
};
