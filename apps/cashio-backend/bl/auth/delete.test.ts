import { describe, it, expect, vi, beforeEach } from "vitest";
import * as authDelete from "./delete";
import * as dal from "../../dal";

vi.mock("../../dal");

describe("Auth Delete BL", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("logOut", () => {
    it("should call dal.logOut with the correct userId", async () => {
      const userId = "12345";
      vi.mocked(dal.logOut).mockResolvedValue(undefined);

      await authDelete.logOut(userId);

      expect(dal.logOut).toHaveBeenCalledTimes(1);
      expect(dal.logOut).toHaveBeenCalledWith(userId);
    });
  });
});
