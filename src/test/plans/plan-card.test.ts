import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  getPlanName,
  getPlanDescription,
  getFeatureText,
  PlanResponse,
  PlanFeatureResponse,
  LocaleKey,
} from "@/types/plan";

/**
 * Property-Based Tests cho Plan Card - Nội dung theo Locale
 * Feature: wallet-management-ui
 */

// Arbitrary để generate PlanFeatureResponse
const planFeatureArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  featureVi: fc.string({ minLength: 1, maxLength: 100 }),
  featureEn: fc.string({ minLength: 1, maxLength: 100 }),
  featureJa: fc.string({ minLength: 1, maxLength: 100 }),
  sortOrder: fc.integer({ min: 1, max: 100 }),
  isHighlighted: fc.boolean(),
});

// Arbitrary để generate PlanResponse
const planArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  nameVi: fc.string({ minLength: 1, maxLength: 100 }),
  nameEn: fc.string({ minLength: 1, maxLength: 100 }),
  nameJa: fc.string({ minLength: 1, maxLength: 100 }),
  descriptionVi: fc.string({ minLength: 1, maxLength: 500 }),
  descriptionEn: fc.string({ minLength: 1, maxLength: 500 }),
  descriptionJa: fc.string({ minLength: 1, maxLength: 500 }),
  monthlyPrice: fc.integer({ min: 0, max: 100000000 }),
  maxEmployees: fc.integer({ min: 1, max: 10000 }),
  isActive: fc.boolean(),
  features: fc.array(planFeatureArbitrary, { minLength: 0, maxLength: 10 }),
});

// Arbitrary cho locale
const localeArbitrary = fc.constantFrom<LocaleKey>("vi", "en", "ja");

describe("PlanCard - Property Tests", () => {
  /**
   * Property 8: Nội dung theo Locale
   *
   * Với bất kỳ Plan_Card nào hiển thị, nội dung (name, description, features)
   * PHẢI hiển thị theo locale hiện tại của user.
   */
  describe("Property 8: Nội dung theo Locale", () => {
    it("getPlanName phải trả về tên đúng cho mỗi locale", () => {
      fc.assert(
        fc.property(planArbitrary, localeArbitrary, (plan, locale) => {
          const result = getPlanName(plan, locale);

          // Kiểm tra kết quả khớp với field locale tương ứng
          switch (locale) {
            case "vi":
              expect(result).toBe(plan.nameVi);
              break;
            case "en":
              expect(result).toBe(plan.nameEn);
              break;
            case "ja":
              expect(result).toBe(plan.nameJa);
              break;
          }
        }),
        { numRuns: 100 },
      );
    });

    it("getPlanDescription phải trả về mô tả đúng cho mỗi locale", () => {
      fc.assert(
        fc.property(planArbitrary, localeArbitrary, (plan, locale) => {
          const result = getPlanDescription(plan, locale);

          // Kiểm tra kết quả khớp với field locale tương ứng
          switch (locale) {
            case "vi":
              expect(result).toBe(plan.descriptionVi);
              break;
            case "en":
              expect(result).toBe(plan.descriptionEn);
              break;
            case "ja":
              expect(result).toBe(plan.descriptionJa);
              break;
          }
        }),
        { numRuns: 100 },
      );
    });

    it("getFeatureText phải trả về text tính năng đúng cho mỗi locale", () => {
      fc.assert(
        fc.property(
          planFeatureArbitrary,
          localeArbitrary,
          (feature, locale) => {
            const result = getFeatureText(feature, locale);

            // Kiểm tra kết quả khớp với field locale tương ứng
            switch (locale) {
              case "vi":
                expect(result).toBe(feature.featureVi);
                break;
              case "en":
                expect(result).toBe(feature.featureEn);
                break;
              case "ja":
                expect(result).toBe(feature.featureJa);
                break;
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it("các hàm locale phải nhất quán - cùng input cùng output", () => {
      fc.assert(
        fc.property(planArbitrary, localeArbitrary, (plan, locale) => {
          // Gọi cùng hàm 2 lần với cùng input phải trả về cùng kết quả
          const name1 = getPlanName(plan, locale);
          const name2 = getPlanName(plan, locale);
          expect(name1).toBe(name2);

          const desc1 = getPlanDescription(plan, locale);
          const desc2 = getPlanDescription(plan, locale);
          expect(desc1).toBe(desc2);
        }),
        { numRuns: 100 },
      );
    });

    it("tất cả locales phải trả về string không rỗng khi plan có nội dung", () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            nameVi: fc.string({ minLength: 1, maxLength: 100 }),
            nameEn: fc.string({ minLength: 1, maxLength: 100 }),
            nameJa: fc.string({ minLength: 1, maxLength: 100 }),
            descriptionVi: fc.string({ minLength: 1, maxLength: 500 }),
            descriptionEn: fc.string({ minLength: 1, maxLength: 500 }),
            descriptionJa: fc.string({ minLength: 1, maxLength: 500 }),
            monthlyPrice: fc.integer({ min: 0, max: 100000000 }),
            maxEmployees: fc.integer({ min: 1, max: 10000 }),
            isActive: fc.boolean(),
            features: fc.array(planFeatureArbitrary, {
              minLength: 0,
              maxLength: 10,
            }),
          }),
          (plan) => {
            // Tất cả locales phải trả về string không rỗng tương ứng
            const locales: LocaleKey[] = ["vi", "en", "ja"];
            for (const locale of locales) {
              const name = getPlanName(plan, locale);
              const desc = getPlanDescription(plan, locale);
              expect(name.length).toBeGreaterThan(0);
              expect(desc.length).toBeGreaterThan(0);
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it("các locales khác nhau phải trả về nội dung khác nhau khi plan có bản dịch khác nhau", () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            // Đảm bảo giá trị khác nhau cho mỗi locale
            nameVi: fc
              .string({ minLength: 5, maxLength: 50 })
              .map((s) => "vi_" + s),
            nameEn: fc
              .string({ minLength: 5, maxLength: 50 })
              .map((s) => "en_" + s),
            nameJa: fc
              .string({ minLength: 5, maxLength: 50 })
              .map((s) => "ja_" + s),
            descriptionVi: fc
              .string({ minLength: 5, maxLength: 100 })
              .map((s) => "vi_" + s),
            descriptionEn: fc
              .string({ minLength: 5, maxLength: 100 })
              .map((s) => "en_" + s),
            descriptionJa: fc
              .string({ minLength: 5, maxLength: 100 })
              .map((s) => "ja_" + s),
            monthlyPrice: fc.integer({ min: 0, max: 100000000 }),
            maxEmployees: fc.integer({ min: 1, max: 10000 }),
            isActive: fc.boolean(),
            features: fc.constant([] as PlanFeatureResponse[]),
          }),
          (plan) => {
            // Các locales khác nhau phải trả về tên khác nhau
            const nameVi = getPlanName(plan, "vi");
            const nameEn = getPlanName(plan, "en");
            const nameJa = getPlanName(plan, "ja");

            expect(nameVi).not.toBe(nameEn);
            expect(nameEn).not.toBe(nameJa);
            expect(nameVi).not.toBe(nameJa);

            // Các locales khác nhau phải trả về mô tả khác nhau
            const descVi = getPlanDescription(plan, "vi");
            const descEn = getPlanDescription(plan, "en");
            const descJa = getPlanDescription(plan, "ja");

            expect(descVi).not.toBe(descEn);
            expect(descEn).not.toBe(descJa);
            expect(descVi).not.toBe(descJa);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
