import { describe, it, expect, vi, beforeEach } from "vitest";
import * as authPost from "./post";
import * as dal from "../../dal";
import * as bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateTokens, generateOTP, sendMail, AppError } from "../../utils";
import { StatusCodes } from "http-status-codes";

vi.mock("../../dal");
vi.mock("bcryptjs");
vi.mock("jsonwebtoken");
vi.mock("../../utils", () => ({
  generateTokens: vi.fn(),
  generateOTP: vi.fn(),
  sendMail: vi.fn(),
  AppError: class AppError extends Error {
    statusCode: number;
    constructor(statusCode: number, message: string) {
      super(message);
      this.statusCode = statusCode;
    }
  }
}));

describe("Auth Post BL", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loginUser", () => {
    it("should throw NOT_FOUND if user does not exist", async () => {
      vi.mocked(dal.getUserByEmail).mockResolvedValue(null);
      await expect(authPost.loginUser("test@test.com", "pass")).rejects.toThrow("משתמש עם האימייל test@test.com לא נמצא");
    });

    it("should throw FORBIDDEN if user is not verified", async () => {
      vi.mocked(dal.getUserByEmail).mockResolvedValue({ id: "1", isVerified: false } as any);
      await expect(authPost.loginUser("test@test.com", "pass")).rejects.toThrow("יש לוודא שמייל תקין");
    });

    it("should return tokens if login is successful", async () => {
      const mockUser = { id: "1", isVerified: true, password: "hashedPassword" };
      vi.mocked(dal.getUserByEmail).mockResolvedValue(mockUser as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(generateTokens).mockReturnValue({ refreshToken: "rt", accessToken: "at" });

      const result = await authPost.loginUser("test@test.com", "pass");
      
      expect(result).toEqual({ refreshToken: "rt", accessToken: "at" });
      expect(dal.addRefreshToken).toHaveBeenCalledWith("1", "rt", expect.any(Date));
    });
  });

  describe("registerUser", () => {
    it("should throw BAD_REQUEST if passwords do not match", async () => {
      await expect(authPost.registerUser({} as any, "mismatch")).rejects.toThrow("הסיסמאות לא תואמות");
    });

    it("should register successfully and send OTP", async () => {
      vi.mocked(dal.getUserByEmail).mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue("hashedPass" as never);
      vi.mocked(generateOTP).mockReturnValue(123456);

      const result = await authPost.registerUser(
        { email: "test@test.com", password: "pass", fullName: "Test User", phone: "1234567890" } as any,
        "pass"
      );

      expect(result).toEqual({ message: "Register successful. Please check your email for the OTP." });
      expect(dal.register).toHaveBeenCalledWith(expect.objectContaining({
        email: "test@test.com", password: "hashedPass", otp: 123456
      }));
      expect(sendMail).toHaveBeenCalledWith({ to: "test@test.com", otp: 123456 });
    });
  });

  describe("refreshToken", () => {
    it("should throw UNAUTHORIZED if payload is string", async () => {
      vi.mocked(jwt.verify).mockReturnValue("string-payload" as any);
      await expect(authPost.refreshToken("token")).rejects.toThrow("טוקן לא חוקי");
    });

    it("should throw NOT_FOUND if user does not exist", async () => {
      vi.mocked(jwt.verify).mockReturnValue({ userId: "1" } as any);
      vi.mocked(dal.getRefreshTokenByUserId).mockResolvedValue({ refreshToken: "token" } as any);
      vi.mocked(dal.getUserById).mockResolvedValue(null);

      await expect(authPost.refreshToken("token")).rejects.toThrow("משתמש לא קיים");
    });

    it("should refresh tokens successfully", async () => {
      vi.mocked(jwt.verify).mockReturnValue({ userId: "1" } as any);
      vi.mocked(dal.getRefreshTokenByUserId).mockResolvedValue({ refreshToken: "token" } as any);
      vi.mocked(dal.getUserById).mockResolvedValue({ id: "1" } as any);
      vi.mocked(generateTokens).mockReturnValue({ refreshToken: "newRt", accessToken: "newAt" });

      const result = await authPost.refreshToken("token");

      expect(result).toEqual({ refreshToken: "newRt", accessToken: "newAt" });
      expect(dal.UpdateToken).toHaveBeenCalledWith("1", "newRt");
    });
  });

  describe("verifyOtp", () => {
    it("should throw BAD_REQUEST if otp is invalid", async () => {
      vi.mocked(dal.getUserByEmail).mockResolvedValue({ id: "1", otpCode: "654321" } as any);
      await expect(authPost.verifyOtp("test@test.com", 123456)).rejects.toThrow("otp לא חוקי");
    });

    it("should verify successfully", async () => {
      vi.mocked(dal.getUserByEmail).mockResolvedValue({ id: "1", otpCode: "123456" } as any);
      vi.mocked(generateTokens).mockReturnValue({ refreshToken: "rt", accessToken: "at" });

      const result = await authPost.verifyOtp("test@test.com", 123456);

      expect(dal.verifyUser).toHaveBeenCalledWith("1");
      expect(result).toEqual({ refreshToken: "rt", accessToken: "at", message: "otp verified" });
    });
  });

  describe("resendOtp", () => {
    it("should resend OTP successfully", async () => {
      vi.mocked(dal.getUserByEmail).mockResolvedValue({ id: "1" } as any);
      vi.mocked(generateOTP).mockReturnValue(123456);

      const result = await authPost.resendOtp("test@test.com");

      expect(result).toEqual({ message: "A new OTP has been sent to your email." });
      expect(dal.updateUserOtp).toHaveBeenCalledWith("test@test.com", 123456);
      expect(sendMail).toHaveBeenCalledWith({ to: "test@test.com", otp: 123456 });
    });
  });
});
