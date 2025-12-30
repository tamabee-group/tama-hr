import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
} from "@/lib/utils/format-date";
import type { SupportedLocale } from "@/lib/utils/format-currency";

/**
 * Property-Based Tests cho Date Format Utility
 * Feature: frontend-i18n-refactor
 * Property 10: Date Format by Locale
 */

describe("formatDate - Property Tests", () => {
  const locales: SupportedLocale[] = ["vi", "en", "ja"];

  /**
   * Property 10: Date Format by Locale
   * Với bất kỳ ngày hợp lệ nào:
   * - Vietnamese/English: format dd/MM/yyyy
   * - Japanese: format yyyy年MM月dd日
   */
  describe("Property 10: Date Format by Locale", () => {
    // Helper để tạo valid date generator
    const validDateArb = fc
      .date({
        min: new Date("1970-01-01"),
        max: new Date("2100-12-31"),
      })
      .filter((d) => !isNaN(d.getTime()));

    it("Vietnamese và English phải dùng format dd/MM/yyyy", () => {
      fc.assert(
        fc.property(
          validDateArb,
          fc.constantFrom("vi" as SupportedLocale, "en" as SupportedLocale),
          (date, locale) => {
            const formatted = formatDate(date, locale);

            // Kiểm tra format dd/MM/yyyy
            const regex = /^\d{2}\/\d{2}\/\d{4}$/;
            expect(formatted).toMatch(regex);

            // Verify các thành phần
            const [day, month, year] = formatted.split("/");
            expect(parseInt(day)).toBe(date.getDate());
            expect(parseInt(month)).toBe(date.getMonth() + 1);
            expect(parseInt(year)).toBe(date.getFullYear());
          },
        ),
        { numRuns: 100 },
      );
    });

    it("Japanese phải dùng format yyyy年MM月dd日", () => {
      fc.assert(
        fc.property(validDateArb, (date) => {
          const formatted = formatDate(date, "ja");

          // Kiểm tra format yyyy年MM月dd日
          const regex = /^\d{4}年\d{2}月\d{2}日$/;
          expect(formatted).toMatch(regex);

          // Verify các thành phần
          const yearMatch = formatted.match(/^(\d{4})年/);
          const monthMatch = formatted.match(/年(\d{2})月/);
          const dayMatch = formatted.match(/月(\d{2})日$/);

          expect(yearMatch).not.toBeNull();
          expect(monthMatch).not.toBeNull();
          expect(dayMatch).not.toBeNull();

          expect(parseInt(yearMatch![1])).toBe(date.getFullYear());
          expect(parseInt(monthMatch![1])).toBe(date.getMonth() + 1);
          expect(parseInt(dayMatch![1])).toBe(date.getDate());
        }),
        { numRuns: 100 },
      );
    });

    it("phải trả về '-' cho null/undefined input", () => {
      fc.assert(
        fc.property(fc.constantFrom(...locales), (locale) => {
          expect(formatDate(null, locale)).toBe("-");
          expect(formatDate(undefined, locale)).toBe("-");
        }),
        { numRuns: 100 },
      );
    });

    it("phải trả về '-' cho invalid date string", () => {
      fc.assert(
        fc.property(
          fc.constantFrom("invalid", "not-a-date", "abc123", ""),
          fc.constantFrom(...locales),
          (invalidDate, locale) => {
            expect(formatDate(invalidDate, locale)).toBe("-");
          },
        ),
        { numRuns: 100 },
      );
    });

    it("phải xử lý được cả Date object và ISO string", () => {
      fc.assert(
        fc.property(
          validDateArb,
          fc.constantFrom(...locales),
          (date, locale) => {
            const fromDate = formatDate(date, locale);
            const fromString = formatDate(date.toISOString(), locale);
            expect(fromDate).toBe(fromString);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});

describe("formatDateTime - Property Tests", () => {
  const locales: SupportedLocale[] = ["vi", "en", "ja"];

  // Helper để tạo valid date generator
  const validDateArb = fc
    .date({
      min: new Date("1970-01-01"),
      max: new Date("2100-12-31"),
    })
    .filter((d) => !isNaN(d.getTime()));

  it("phải bao gồm date và time components", () => {
    fc.assert(
      fc.property(validDateArb, fc.constantFrom(...locales), (date, locale) => {
        const formatted = formatDateTime(date, locale);

        // Phải có time component HH:mm
        const timeRegex = /\d{2}:\d{2}$/;
        expect(formatted).toMatch(timeRegex);

        // Verify time values
        const timeMatch = formatted.match(/(\d{2}):(\d{2})$/);
        expect(timeMatch).not.toBeNull();
        expect(parseInt(timeMatch![1])).toBe(date.getHours());
        expect(parseInt(timeMatch![2])).toBe(date.getMinutes());
      }),
      { numRuns: 100 },
    );
  });

  it("phải trả về '-' cho null/undefined input", () => {
    fc.assert(
      fc.property(fc.constantFrom(...locales), (locale) => {
        expect(formatDateTime(null, locale)).toBe("-");
        expect(formatDateTime(undefined, locale)).toBe("-");
      }),
      { numRuns: 100 },
    );
  });
});

describe("formatRelativeTime - Property Tests", () => {
  // Helper để tạo valid date generator cho relative time
  const validRelativeDateArb = fc
    .date({
      min: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 năm trước
      max: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 năm sau
    })
    .filter((d) => !isNaN(d.getTime()));

  it("phải trả về string không rỗng cho valid dates", () => {
    fc.assert(
      fc.property(
        validRelativeDateArb,
        fc.constantFrom(
          "vi" as SupportedLocale,
          "en" as SupportedLocale,
          "ja" as SupportedLocale,
        ),
        (date, locale) => {
          const formatted = formatRelativeTime(date, locale);
          expect(typeof formatted).toBe("string");
          expect(formatted.length).toBeGreaterThan(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("phải trả về '-' cho invalid date string", () => {
    expect(formatRelativeTime("invalid-date", "en")).toBe("-");
  });
});
