import { describe, it, expect, vi, beforeEach } from "vitest";
import * as walletGet from "./get";
import * as dal from "../../dal";

vi.mock("../../dal");

describe("Wallet Get BL", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getBalance", () => {
    it("should call dal.getBalance and return the balance", async () => {
      const mockBalance = 5000;
      vi.mocked(dal.getBalance).mockResolvedValue(mockBalance as any);

      const result = await walletGet.getBalance("1");

      expect(dal.getBalance).toHaveBeenCalledWith("1");
      expect(result).toEqual(mockBalance);
    });
  });
});
