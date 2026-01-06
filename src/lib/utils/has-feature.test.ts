import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { hasFeature } from "./has-feature";
import { PlanFeature } from "@/types/plan";

/**
 * Property 7: hasFeature Helper
 * Validates: Requirements 6.3
 *
 * For any feature code, hasFeature(code) SHALL return true
 * if and only if the features array contains an entry
 * with matching code and enabled = true.
 */
describe("hasFeature - Property 7", () => {
  // Generator cho PlanFeature
  const planFeatureArb = fc.record({
    code: fc.string({ minLength: 1, maxLength: 20 }),
    enabled: fc.boolean(),
  });

  // Generator cho array of PlanFeatures
  const featuresArrayArb = fc.array(planFeatureArb, {
    minLength: 0,
    maxLength: 10,
  });

  it("should return true iff feature exists with enabled=true", () => {
    fc.assert(
      fc.property(
        featuresArrayArb,
        fc.string({ minLength: 1, maxLength: 20 }),
        (features, code) => {
          const result = hasFeature(features, code);

          // Tìm feature với code và enabled = true
          const hasEnabledFeature = features.some(
            (f) => f.code === code && f.enabled === true,
          );

          // hasFeature phải trả về true khi và chỉ khi có feature enabled
          expect(result).toBe(hasEnabledFeature);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should return false for empty features array", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 20 }), (code) => {
        const result = hasFeature([], code);
        expect(result).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  it("should return false when feature exists but disabled", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 20 }), (code) => {
        const features: PlanFeature[] = [{ code, enabled: false }];
        const result = hasFeature(features, code);
        expect(result).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  it("should return true when feature exists and enabled", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 20 }), (code) => {
        const features: PlanFeature[] = [{ code, enabled: true }];
        const result = hasFeature(features, code);
        expect(result).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});
