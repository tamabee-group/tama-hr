import { describe, it, expect, vi } from "vitest";
import {
  getErrorMessage,
  isKnownErrorCode,
  KNOWN_ERROR_CODES,
} from "@/lib/utils/get-error-message";

/**
 * Unit Tests cho Error Message Utility
 * Feature: frontend-i18n-refactor
 */

describe("getErrorMessage", () => {
  // Mock translation function
  const createMockTranslation = (translations: Record<string, string>) => {
    return (key: string) => translations[key] || key;
  };

  describe("known error codes return correct translation", () => {
    it("should return translated message for INVALID_CREDENTIALS", () => {
      const t = createMockTranslation({
        generic: "Đã xảy ra lỗi",
        INVALID_CREDENTIALS: "Email hoặc mật khẩu không đúng",
      });

      const result = getErrorMessage("INVALID_CREDENTIALS", t);
      expect(result).toBe("Email hoặc mật khẩu không đúng");
    });

    it("should return translated message for EMAIL_EXISTS", () => {
      const t = createMockTranslation({
        generic: "Đã xảy ra lỗi",
        EMAIL_EXISTS: "Email đã được đăng ký",
      });

      const result = getErrorMessage("EMAIL_EXISTS", t);
      expect(result).toBe("Email đã được đăng ký");
    });

    it("should return translated message for USER_NOT_FOUND", () => {
      const t = createMockTranslation({
        generic: "Đã xảy ra lỗi",
        USER_NOT_FOUND: "Không tìm thấy người dùng",
      });

      const result = getErrorMessage("USER_NOT_FOUND", t);
      expect(result).toBe("Không tìm thấy người dùng");
    });

    it("should return translated message for INSUFFICIENT_BALANCE", () => {
      const t = createMockTranslation({
        generic: "Đã xảy ra lỗi",
        INSUFFICIENT_BALANCE: "Số dư ví không đủ",
      });

      const result = getErrorMessage("INSUFFICIENT_BALANCE", t);
      expect(result).toBe("Số dư ví không đủ");
    });
  });

  describe("unknown error codes return generic message", () => {
    it("should return generic message for unknown error code", () => {
      const t = createMockTranslation({
        generic: "Đã xảy ra lỗi. Vui lòng thử lại.",
        INVALID_CREDENTIALS: "Email hoặc mật khẩu không đúng",
      });

      const result = getErrorMessage("UNKNOWN_ERROR_CODE", t);
      expect(result).toBe("Đã xảy ra lỗi. Vui lòng thử lại.");
    });

    it("should return generic message for null error code", () => {
      const t = createMockTranslation({
        generic: "Đã xảy ra lỗi",
      });

      const result = getErrorMessage(null, t);
      expect(result).toBe("Đã xảy ra lỗi");
    });

    it("should return generic message for undefined error code", () => {
      const t = createMockTranslation({
        generic: "Đã xảy ra lỗi",
      });

      const result = getErrorMessage(undefined, t);
      expect(result).toBe("Đã xảy ra lỗi");
    });

    it("should return generic message for empty string error code", () => {
      const t = createMockTranslation({
        generic: "Đã xảy ra lỗi",
        "": "Empty key translation",
      });

      const result = getErrorMessage("", t);
      expect(result).toBe("Đã xảy ra lỗi");
    });
  });

  describe("fallback behavior", () => {
    it("should fallback to generic when translation returns the key itself", () => {
      // Simulating next-intl behavior when key not found
      const t = (key: string) => key;

      const result = getErrorMessage("SOME_UNKNOWN_ERROR", t);
      expect(result).toBe("generic");
    });

    it("should fallback to generic when translation throws", () => {
      const t = vi.fn().mockImplementation((key: string) => {
        if (key === "generic") return "Đã xảy ra lỗi";
        throw new Error("Translation not found");
      });

      const result = getErrorMessage("THROWING_ERROR", t);
      expect(result).toBe("Đã xảy ra lỗi");
    });
  });
});

describe("isKnownErrorCode", () => {
  it("should return true for known error codes", () => {
    expect(isKnownErrorCode("INVALID_CREDENTIALS")).toBe(true);
    expect(isKnownErrorCode("EMAIL_EXISTS")).toBe(true);
    expect(isKnownErrorCode("USER_NOT_FOUND")).toBe(true);
    expect(isKnownErrorCode("INSUFFICIENT_BALANCE")).toBe(true);
  });

  it("should return false for unknown error codes", () => {
    expect(isKnownErrorCode("UNKNOWN_ERROR")).toBe(false);
    expect(isKnownErrorCode("RANDOM_CODE")).toBe(false);
  });

  it("should return false for null/undefined", () => {
    expect(isKnownErrorCode(null)).toBe(false);
    expect(isKnownErrorCode(undefined)).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(isKnownErrorCode("")).toBe(false);
  });
});

describe("KNOWN_ERROR_CODES", () => {
  it("should contain expected error codes", () => {
    expect(KNOWN_ERROR_CODES).toContain("INVALID_CREDENTIALS");
    expect(KNOWN_ERROR_CODES).toContain("EMAIL_EXISTS");
    expect(KNOWN_ERROR_CODES).toContain("USER_NOT_FOUND");
    expect(KNOWN_ERROR_CODES).toContain("COMPANY_NOT_FOUND");
    expect(KNOWN_ERROR_CODES).toContain("INVALID_OTP");
    expect(KNOWN_ERROR_CODES).toContain("OTP_EXPIRED");
    expect(KNOWN_ERROR_CODES).toContain("INSUFFICIENT_BALANCE");
    expect(KNOWN_ERROR_CODES).toContain("PLAN_IN_USE");
  });
});
