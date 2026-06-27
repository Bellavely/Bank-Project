import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTransaction, acceptTransaction } from "./post";
import * as dal from "../../dal";
import { getIO } from "../../utils/socket";

// Mock the DAL layer
vi.mock("../../dal", () => ({
  getUserByEmail: vi.fn(),
  getBalance: vi.fn(),
  createTransaction: vi.fn(),
  transferMoney: vi.fn(),
  updateTransaction: vi.fn(),
}));

// Mock the Socket utility
vi.mock("../../utils/socket", () => ({
  getIO: vi.fn(),
}));

describe("Transactions Business Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createTransaction", () => {
    it("should throw error 404 if receiver is not found", async () => {
      vi.mocked(dal.getUserByEmail).mockResolvedValue(null);

      await expect(
        createTransaction("sender-123", "Message", "nonexistent@email.com", 100)
      ).rejects.toThrow("משתמש עם האימייל nonexistent@email.com לא נמצא");
    });

    it("should throw error 404 if sender balance is not found", async () => {
      vi.mocked(dal.getUserByEmail).mockResolvedValue({ id: "receiver-123", email: "receiver@email.com" } as any);
      vi.mocked(dal.getBalance).mockResolvedValue(null);

      await expect(
        createTransaction("sender-123", "Message", "receiver@email.com", 100)
      ).rejects.toThrow("יתרה של המשתמש sender-123 לא נמצאה");
    });

    it("should throw error 400 if sender balance is insufficient", async () => {
      vi.mocked(dal.getUserByEmail).mockResolvedValue({ id: "receiver-123", email: "receiver@email.com" } as any);
      vi.mocked(dal.getBalance).mockResolvedValue({ balance: 50 } as any);

      await expect(
        createTransaction("sender-123", "Message", "receiver@email.com", 100)
      ).rejects.toThrow("לא ניתן לבצע את ההעברה היתרה נמוכה מידי");
    });

    it("should create transaction successfully", async () => {
      vi.mocked(dal.getUserByEmail).mockResolvedValue({ id: "receiver-123", email: "receiver@email.com" } as any);
      vi.mocked(dal.getBalance).mockResolvedValue({ balance: 150 } as any);
      vi.mocked(dal.createTransaction).mockResolvedValue({ id: "transaction-999" } as any);

      const result = await createTransaction("sender-123", "Message", "receiver@email.com", 100);

      expect(dal.createTransaction).toHaveBeenCalledWith({
        reciverId: "receiver-123",
        senderId: "sender-123",
        amount: 100,
        message: "Message",
        status: "PENDING",
      });
      expect(result).toEqual({ message: "ההעברה בוצעה", transactionId: "transaction-999" });
    });
  });

  describe("acceptTransaction", () => {
    it("should accept transaction and emit balanceUpdated to sender and receiver", async () => {
      const mockTransaction = {
        id: "transaction-999",
        senderId: "sender-123",
        reciverId: "receiver-123",
        amount: 100,
      };
      
      const mockEmit = vi.fn();
      const mockTo = vi.fn().mockReturnValue({ emit: mockEmit });
      vi.mocked(dal.transferMoney).mockResolvedValue(mockTransaction as any);
      vi.mocked(getIO).mockReturnValue({ to: mockTo } as any);

      const result = await acceptTransaction("transaction-999");

      expect(dal.transferMoney).toHaveBeenCalledWith("transaction-999");
      expect(getIO).toHaveBeenCalled();
      expect(mockTo).toHaveBeenCalledWith("sender-123");
      expect(mockTo).toHaveBeenCalledWith("receiver-123");
      expect(mockEmit).toHaveBeenCalledTimes(2);
      expect(mockEmit).toHaveBeenCalledWith("balanceUpdated");
      expect(result).toEqual(mockTransaction);
    });
  });
});
