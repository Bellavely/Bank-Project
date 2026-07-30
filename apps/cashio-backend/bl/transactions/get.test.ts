import { describe, it, expect, vi, beforeEach } from "vitest";
import * as transactionsGet from "./get";
import * as dal from "../../dal";
import { TransactionStatus } from "@prisma/client";

vi.mock("../../dal");

describe("Transactions Get BL", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllTransactionsByUser", () => {
    it("should call dal.getTransactionsByUser with correct arguments", async () => {
      const mockTransactions = [{ id: "t1" }, { id: "t2" }];
      vi.mocked(dal.getTransactionsByUser).mockResolvedValue(mockTransactions as any);

      const userId = "user1";
      const page = 1;
      const limit = 10;
      const status = TransactionStatus.COMPLETED;
      const search = "hello";

      const result = await transactionsGet.getAllTransactionsByUser(userId, page, limit, status, search);

      expect(dal.getTransactionsByUser).toHaveBeenCalledWith(userId, page, limit, status, search);
      expect(result).toEqual(mockTransactions);
    });

    it("should call dal.getTransactionsByUser with optional arguments undefined", async () => {
      const mockTransactions = [{ id: "t1" }];
      vi.mocked(dal.getTransactionsByUser).mockResolvedValue(mockTransactions as any);

      const userId = "user1";

      const result = await transactionsGet.getAllTransactionsByUser(userId);

      expect(dal.getTransactionsByUser).toHaveBeenCalledWith(userId, undefined, undefined, undefined, undefined);
      expect(result).toEqual(mockTransactions);
    });
  });
});
