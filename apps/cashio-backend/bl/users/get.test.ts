import { describe, it, expect, vi, beforeEach } from "vitest";
import * as usersGet from "./get";
import * as dal from "../../dal";

vi.mock("../../dal");

describe("Users Get BL", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserById", () => {
    it("should call dal.getUserById and return the user", async () => {
      const mockUser = { id: "1", email: "test@test.com" };
      vi.mocked(dal.getUserById).mockResolvedValue(mockUser as any);

      const result = await usersGet.getUserById("1");

      expect(dal.getUserById).toHaveBeenCalledWith("1");
      expect(result).toEqual(mockUser);
    });
  });

  describe("getUserByEmail", () => {
    it("should call dal.getUserByEmail and return the user", async () => {
      const mockUser = { id: "1", email: "test@test.com" };
      vi.mocked(dal.getUserByEmail).mockResolvedValue(mockUser as any);

      const result = await usersGet.getUserByEmail("test@test.com");

      expect(dal.getUserByEmail).toHaveBeenCalledWith("test@test.com");
      expect(result).toEqual(mockUser);
    });
  });
});
