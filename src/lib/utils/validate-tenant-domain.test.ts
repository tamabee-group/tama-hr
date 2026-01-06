import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { validateTenantDomain } from "./validate-tenant-domain";

/**
 * Property 1: Tenant Domain Validation
 * Validates: Requirements 1.2
 *
 * For any input string, the tenant domain validation function SHALL return valid
 * only if the string contains only lowercase letters, numbers, and hyphens,
 * has length between 3-30 characters, and does not start or end with a hyphen.
 */
describe("validateTenantDomain - Property 1", () => {
  // Valid chars cho domain
  const validChars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const validCharsWithHyphen = validChars + "-";

  // Generator cho valid domain
  const validDomainArb = fc
    .tuple(
      // Ký tự đầu: không phải hyphen
      fc
        .integer({ min: 0, max: validChars.length - 1 })
        .map((i) => validChars[i]),
      // Ký tự giữa: có thể có hyphen
      fc.array(
        fc
          .integer({ min: 0, max: validCharsWithHyphen.length - 1 })
          .map((i) => validCharsWithHyphen[i]),
        { minLength: 1, maxLength: 28 },
      ),
      // Ký tự cuối: không phải hyphen
      fc
        .integer({ min: 0, max: validChars.length - 1 })
        .map((i) => validChars[i]),
    )
    .map(([start, middle, end]) => start + middle.join("") + end)
    .filter((s) => s.length >= 3 && s.length <= 30);

  it("should return valid=true for valid domains", () => {
    fc.assert(
      fc.property(validDomainArb, (domain) => {
        const result = validateTenantDomain(domain);
        expect(result.valid).toBe(true);
        expect(result.errorCode).toBeUndefined();
      }),
      { numRuns: 100 },
    );
  });

  it("should return TOO_SHORT for domains less than 3 chars", () => {
    // Generator cho string ngắn (0-2 chars) với valid chars
    const shortDomainArb = fc
      .array(
        fc
          .integer({ min: 0, max: validChars.length - 1 })
          .map((i) => validChars[i]),
        { minLength: 0, maxLength: 2 },
      )
      .map((arr) => arr.join(""));

    fc.assert(
      fc.property(shortDomainArb, (domain) => {
        const result = validateTenantDomain(domain);
        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe("TOO_SHORT");
      }),
      { numRuns: 100 },
    );
  });

  it("should return TOO_LONG for domains more than 30 chars", () => {
    // Generator cho string dài (31-50 chars) với valid chars
    const longDomainArb = fc
      .array(
        fc
          .integer({ min: 0, max: validChars.length - 1 })
          .map((i) => validChars[i]),
        { minLength: 31, maxLength: 50 },
      )
      .map((arr) => arr.join(""));

    fc.assert(
      fc.property(longDomainArb, (domain) => {
        const result = validateTenantDomain(domain);
        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe("TOO_LONG");
      }),
      { numRuns: 100 },
    );
  });

  it("should return INVALID_CHARS for domains with uppercase or special chars", () => {
    // Generator cho string có ít nhất 1 ký tự không hợp lệ
    const invalidChars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+=[]{}|;:,.<>?/~` ";

    const invalidDomainArb = fc
      .tuple(
        // Phần valid đầu
        fc.array(
          fc
            .integer({ min: 0, max: validChars.length - 1 })
            .map((i) => validChars[i]),
          { minLength: 1, maxLength: 10 },
        ),
        // Ít nhất 1 ký tự không hợp lệ
        fc
          .integer({ min: 0, max: invalidChars.length - 1 })
          .map((i) => invalidChars[i]),
        // Phần valid cuối
        fc.array(
          fc
            .integer({ min: 0, max: validChars.length - 1 })
            .map((i) => validChars[i]),
          { minLength: 1, maxLength: 10 },
        ),
      )
      .map(([a, b, c]) => a.join("") + b + c.join(""))
      .filter((s) => s.length >= 3 && s.length <= 30);

    fc.assert(
      fc.property(invalidDomainArb, (domain) => {
        const result = validateTenantDomain(domain);
        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe("INVALID_CHARS");
      }),
      { numRuns: 100 },
    );
  });

  it("should return INVALID_HYPHEN for domains starting with hyphen", () => {
    // Generator cho domain bắt đầu bằng hyphen
    const leadingHyphenArb = fc
      .array(
        fc
          .integer({ min: 0, max: validChars.length - 1 })
          .map((i) => validChars[i]),
        { minLength: 2, maxLength: 29 },
      )
      .map((arr) => "-" + arr.join(""));

    fc.assert(
      fc.property(leadingHyphenArb, (domain) => {
        const result = validateTenantDomain(domain);
        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe("INVALID_HYPHEN");
      }),
      { numRuns: 100 },
    );
  });

  it("should return INVALID_HYPHEN for domains ending with hyphen", () => {
    // Generator cho domain kết thúc bằng hyphen
    const trailingHyphenArb = fc
      .array(
        fc
          .integer({ min: 0, max: validChars.length - 1 })
          .map((i) => validChars[i]),
        { minLength: 2, maxLength: 29 },
      )
      .map((arr) => arr.join("") + "-");

    fc.assert(
      fc.property(trailingHyphenArb, (domain) => {
        const result = validateTenantDomain(domain);
        expect(result.valid).toBe(false);
        expect(result.errorCode).toBe("INVALID_HYPHEN");
      }),
      { numRuns: 100 },
    );
  });

  // Comprehensive property: valid iff all conditions met
  it("should return valid=true iff all validation rules pass", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 0, maxLength: 50 }), (domain) => {
        const result = validateTenantDomain(domain);

        const isLengthValid = domain.length >= 3 && domain.length <= 30;
        const hasValidChars = /^[a-z0-9-]+$/.test(domain);
        const noLeadingTrailingHyphen =
          !domain.startsWith("-") && !domain.endsWith("-");

        const shouldBeValid =
          isLengthValid && hasValidChars && noLeadingTrailingHyphen;

        expect(result.valid).toBe(shouldBeValid);
      }),
      { numRuns: 100 },
    );
  });
});
