import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  formatCurrency,
  isValidCurrencyFormat,
  SupportedLocale,
} from "@/lib/utils/format-currency";

/**
 * Property-Based Tests cho Currency Format Utility
 * Feature: wallet-management-ui
 */

describe("formatCurrency - Property Tests", () => {
  /**
   * Property 1: Tính nhất quán của định dạng tiền tệ
   *
   * Với bất kỳ số tiền và locale nào, formatCurrency(amount, locale) PHẢI trả về string với format đúng:
   * - vi: "1.000.000 ₫"
   * - en: "$1,000,000"
   * - ja: "¥1,000,000"
   */
  describe("Property 1: Tính nhất quán của định dạng tiền tệ", () => {
    const locales: SupportedLocale[] = ["vi", "en", "ja"];

    it("phải trả về format hợp lệ cho bất kỳ số tiền và locale nào", () => {
      fc.assert(
        fc.property(
          // Tạo số tiền từ 0 đến 1 tỷ
          fc.integer({ min: 0, max: 1000000000 }),
          fc.constantFrom(...locales),
          (amount, locale) => {
            const formatted = formatCurrency(amount, locale);

            // Kiểm tra kết quả là string không rỗng
            expect(typeof formatted).toBe("string");
            expect(formatted.length).toBeGreaterThan(0);

            // Kiểm tra format hợp lệ cho locale
            expect(isValidCurrencyFormat(formatted, locale)).toBe(true);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("phải bao gồm ký hiệu VND (₫) cho locale vi", () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 1000000000 }), (amount) => {
          const formatted = formatCurrency(amount, "vi");
          expect(formatted.includes("₫") || formatted.includes("VND")).toBe(
            true,
          );
        }),
        { numRuns: 100 },
      );
    });

    it("phải bao gồm ký hiệu USD ($) cho locale en", () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 1000000000 }), (amount) => {
          const formatted = formatCurrency(amount, "en");
          expect(formatted.includes("$")).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it("phải bao gồm ký hiệu JPY (¥) cho locale ja", () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 1000000000 }), (amount) => {
          const formatted = formatCurrency(amount, "ja");
          expect(formatted.includes("¥") || formatted.includes("￥")).toBe(
            true,
          );
        }),
        { numRuns: 100 },
      );
    });

    it("phải xử lý đúng số tiền bằng 0 cho tất cả locales", () => {
      fc.assert(
        fc.property(fc.constantFrom(...locales), (locale) => {
          const formatted = formatCurrency(0, locale);
          expect(formatted).toBeTruthy();
          expect(isValidCurrencyFormat(formatted, locale)).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it("phải xử lý đúng số tiền lớn", () => {
      fc.assert(
        fc.property(
          // Tạo số tiền lớn (100 triệu đến 10 tỷ)
          fc.integer({ min: 100000000, max: 10000000000 }),
          fc.constantFrom(...locales),
          (amount, locale) => {
            const formatted = formatCurrency(amount, locale);
            expect(formatted).toBeTruthy();
            expect(isValidCurrencyFormat(formatted, locale)).toBe(true);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("phải tạo output nhất quán cho cùng input", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000000000 }),
          fc.constantFrom(...locales),
          (amount, locale) => {
            const formatted1 = formatCurrency(amount, locale);
            const formatted2 = formatCurrency(amount, locale);
            expect(formatted1).toBe(formatted2);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
