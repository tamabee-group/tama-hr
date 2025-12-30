import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  formatRequesterName,
  formatRequesterFullInfo,
  RequesterInfo,
} from "@/lib/utils/format-requester";
import { SupportedLocale } from "@/lib/utils/format-currency";

/**
 * Property-Based Tests cho Format Requester Utility
 * Feature: tamabee-role-redesign-frontend
 * Property 2: Requester info formatting nhất quán
 * Validates: Requirements 4.3, 4.4
 */

describe("formatRequesterName - Property Tests", () => {
  /**
   * Property 2: Requester info formatting nhất quán
   *
   * For any deposit request, nếu requesterName tồn tại thì hiển thị requesterName,
   * ngược lại hiển thị requestedBy (employee code).
   * Format này SHALL nhất quán ở tất cả các views.
   */
  describe("Property 2: Requester info formatting nhất quán", () => {
    // Generator cho RequesterInfo với requesterName
    const requesterWithName = fc.record({
      requestedBy: fc.string({ minLength: 1, maxLength: 10 }),
      requesterName: fc
        .string({ minLength: 1, maxLength: 50 })
        .filter((s) => s.trim().length > 0),
      requesterEmail: fc.option(fc.emailAddress(), { nil: undefined }),
    });

    // Generator cho RequesterInfo không có requesterName
    const requesterWithoutName = fc.record({
      requestedBy: fc.string({ minLength: 1, maxLength: 10 }),
      requesterName: fc.constantFrom(undefined, "", "   "),
      requesterEmail: fc.option(fc.emailAddress(), { nil: undefined }),
    });

    it("phải trả về requesterName khi có requesterName hợp lệ", () => {
      fc.assert(
        fc.property(requesterWithName, (info) => {
          const result = formatRequesterName(info as RequesterInfo);
          expect(result).toBe(info.requesterName!.trim());
        }),
        { numRuns: 100 },
      );
    });

    it("phải fallback về requestedBy khi không có requesterName", () => {
      fc.assert(
        fc.property(requesterWithoutName, (info) => {
          const result = formatRequesterName(info as RequesterInfo);
          expect(result).toBe(info.requestedBy || "-");
        }),
        { numRuns: 100 },
      );
    });

    it("phải trả về kết quả nhất quán cho cùng input", () => {
      fc.assert(
        fc.property(
          fc.oneof(requesterWithName, requesterWithoutName),
          (info) => {
            const result1 = formatRequesterName(info as RequesterInfo);
            const result2 = formatRequesterName(info as RequesterInfo);
            expect(result1).toBe(result2);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("phải luôn trả về string không rỗng hoặc '-'", () => {
      fc.assert(
        fc.property(
          fc.oneof(requesterWithName, requesterWithoutName),
          (info) => {
            const result = formatRequesterName(info as RequesterInfo);
            expect(typeof result).toBe("string");
            expect(result.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});

describe("formatRequesterFullInfo - Property Tests", () => {
  const locales: SupportedLocale[] = ["vi", "en", "ja"];

  // Generator cho RequesterInfo đầy đủ
  const fullRequesterInfo = fc.record({
    requestedBy: fc.string({ minLength: 1, maxLength: 10 }),
    requesterName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), {
      nil: undefined,
    }),
    requesterEmail: fc.option(fc.emailAddress(), { nil: undefined }),
  });

  it("phải trả về đúng cấu trúc cho tất cả locales", () => {
    fc.assert(
      fc.property(
        fullRequesterInfo,
        fc.constantFrom(...locales),
        (info, locale) => {
          const result = formatRequesterFullInfo(info as RequesterInfo, locale);

          // Kiểm tra cấu trúc
          expect(result).toHaveProperty("displayName");
          expect(result).toHaveProperty("email");
          expect(result).toHaveProperty("employeeCode");
          expect(result).toHaveProperty("labels");

          // Kiểm tra labels có đủ fields
          expect(result.labels).toHaveProperty("name");
          expect(result.labels).toHaveProperty("email");
          expect(result.labels).toHaveProperty("employeeCode");
        },
      ),
      { numRuns: 100 },
    );
  });

  it("displayName phải nhất quán với formatRequesterName", () => {
    fc.assert(
      fc.property(
        fullRequesterInfo,
        fc.constantFrom(...locales),
        (info, locale) => {
          const fullInfo = formatRequesterFullInfo(
            info as RequesterInfo,
            locale,
          );
          const nameOnly = formatRequesterName(info as RequesterInfo);

          expect(fullInfo.displayName).toBe(nameOnly);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("employeeCode phải bằng requestedBy hoặc '-'", () => {
    fc.assert(
      fc.property(fullRequesterInfo, (info) => {
        const result = formatRequesterFullInfo(info as RequesterInfo);
        expect(result.employeeCode).toBe(info.requestedBy || "-");
      }),
      { numRuns: 100 },
    );
  });

  it("email phải bằng requesterEmail hoặc '-'", () => {
    fc.assert(
      fc.property(fullRequesterInfo, (info) => {
        const result = formatRequesterFullInfo(info as RequesterInfo);
        expect(result.email).toBe(info.requesterEmail || "-");
      }),
      { numRuns: 100 },
    );
  });

  it("labels phải đúng theo locale", () => {
    const expectedLabels = {
      vi: { name: "Tên", email: "Email", employeeCode: "Mã nhân viên" },
      en: { name: "Name", email: "Email", employeeCode: "Employee Code" },
      ja: { name: "名前", email: "メール", employeeCode: "社員コード" },
    };

    fc.assert(
      fc.property(
        fullRequesterInfo,
        fc.constantFrom(...locales),
        (info, locale) => {
          const result = formatRequesterFullInfo(info as RequesterInfo, locale);
          expect(result.labels).toEqual(expectedLabels[locale]);
        },
      ),
      { numRuns: 100 },
    );
  });
});
