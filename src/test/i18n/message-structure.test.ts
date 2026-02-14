import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import * as fs from "fs";
import * as path from "path";
import {
  DEPOSIT_STATUSES,
  TRANSACTION_TYPES,
  USER_STATUSES,
  COMMISSION_STATUSES,
  GENDERS,
  TAMABEE_USER_ROLES,
  COMPANY_USER_ROLES,
} from "@/types/enums";
import {
  ROUNDING_INTERVALS,
  ROUNDING_DIRECTIONS,
  SALARY_TYPES,
  ATTENDANCE_STATUSES,
  PAYMENT_STATUSES,
  ADJUSTMENT_STATUSES,
  SELECTION_STATUSES,
  SCHEDULE_TYPES,
  ALLOWANCE_TYPES,
  DEDUCTION_TYPES,
  LEAVE_TYPES,
  LEAVE_STATUSES,
  BREAK_TYPES,
  PAYROLL_PERIOD_STATUSES,
  PAYROLL_ITEM_STATUSES,
} from "@/types/attendance-enums";

type MessageObject = Record<string, unknown>;

/**
 * Load và merge tất cả namespace files cho một locale
 */
function loadMessagesForLocale(locale: string): MessageObject {
  const messagesDir = path.join(process.cwd(), "messages", locale);
  const messages: MessageObject = {};

  if (!fs.existsSync(messagesDir)) {
    // Fallback to single file nếu chưa migrate
    const singleFile = path.join(process.cwd(), "messages", `${locale}.json`);
    if (fs.existsSync(singleFile)) {
      return JSON.parse(fs.readFileSync(singleFile, "utf-8"));
    }
    return {};
  }

  const files = fs.readdirSync(messagesDir).filter((f) => f.endsWith(".json"));
  for (const file of files) {
    const namespace = file.replace(".json", "");
    const filePath = path.join(messagesDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    messages[namespace] = content;
  }

  return messages;
}

// Load messages từ namespace-based structure
const viMessages = loadMessagesForLocale("vi");
const enMessages = loadMessagesForLocale("en");
const jaMessages = loadMessagesForLocale("ja");

/**
 * Lấy tất cả key paths và depth của chúng từ một object
 */
function getKeyDepths(
  obj: MessageObject,
  prefix = "",
): { key: string; depth: number }[] {
  const results: { key: string; depth: number }[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const depth = fullKey.split(".").length;
    results.push({ key: fullKey, depth });
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      results.push(...getKeyDepths(value as MessageObject, fullKey));
    }
  }
  return results;
}

/**
 * Lấy tất cả key paths từ một object (chỉ leaf keys)
 */
function getAllKeys(obj: MessageObject, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      keys.push(...getAllKeys(value as MessageObject, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

/**
 * Lấy tất cả key names (không phải paths) từ một object
 */
function getAllKeyNames(obj: MessageObject): string[] {
  const keyNames: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    keyNames.push(key);
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      keyNames.push(...getAllKeyNames(value as MessageObject));
    }
  }
  return keyNames;
}

describe("Message File Structure Properties", () => {
  /**
   * Property 1: Message File Key Depth Validation
   * For any key path in a message file, the depth SHALL NOT exceed 3 levels.
   */
  it("Property 1: all keys should have depth <= 3", () => {
    const allMessages = [
      { name: "en", messages: enMessages },
      { name: "vi", messages: viMessages },
      { name: "ja", messages: jaMessages },
    ];

    for (const { name, messages } of allMessages) {
      const allKeys = getKeyDepths(messages as MessageObject);

      fc.assert(
        fc.property(fc.constantFrom(...allKeys), ({ key, depth }) => {
          expect(
            depth,
            `Key "${key}" in ${name}.json exceeds max depth of 3 (actual: ${depth})`,
          ).toBeLessThanOrEqual(3);
          return depth <= 3;
        }),
        { numRuns: allKeys.length },
      );
    }
  });

  /**
   * Property 2: Message File Key Consistency Across Locales
   * For any translation key that exists in one locale file, that same key SHALL exist in all other locale files.
   */
  it("Property 2: all locales should have the same keys", () => {
    const viKeys = getAllKeys(viMessages as MessageObject);
    const enKeys = getAllKeys(enMessages as MessageObject);
    const jaKeys = getAllKeys(jaMessages as MessageObject);

    // Kiểm tra en vs vi
    const missingInVi = enKeys.filter((k) => !viKeys.includes(k));
    const missingInEn = viKeys.filter((k) => !enKeys.includes(k));
    const missingInJa = enKeys.filter((k) => !jaKeys.includes(k));
    const extraInJa = jaKeys.filter((k) => !enKeys.includes(k));

    expect(
      missingInVi,
      `Keys missing in vi.json: ${missingInVi.join(", ")}`,
    ).toHaveLength(0);
    expect(
      missingInEn,
      `Keys missing in en.json: ${missingInEn.join(", ")}`,
    ).toHaveLength(0);
    expect(
      missingInJa,
      `Keys missing in ja.json: ${missingInJa.join(", ")}`,
    ).toHaveLength(0);
    expect(
      extraInJa,
      `Extra keys in ja.json: ${extraInJa.join(", ")}`,
    ).toHaveLength(0);

    // Property test: for any key in en, it should exist in vi and ja
    fc.assert(
      fc.property(fc.constantFrom(...enKeys), (key) => {
        return viKeys.includes(key) && jaKeys.includes(key);
      }),
      { numRuns: enKeys.length },
    );
  });

  /**
   * Property 3: Message File CamelCase Key Naming
   * For any key name in a message file, the key SHALL follow camelCase naming convention.
   */
  it("Property 3: all keys should be camelCase", () => {
    // camelCase: bắt đầu bằng chữ thường, không có underscore hoặc hyphen
    // Cho phép UPPER_CASE cho error codes (như INVALID_CREDENTIALS)
    const camelCaseRegex = /^[a-z][a-zA-Z0-9]*$/;
    const upperCaseRegex = /^[A-Z][A-Z0-9_]*$/;

    const allKeyNames = getAllKeyNames(enMessages as MessageObject);

    fc.assert(
      fc.property(fc.constantFrom(...allKeyNames), (key) => {
        const isCamelCase = camelCaseRegex.test(key);
        const isUpperCase = upperCaseRegex.test(key);
        expect(
          isCamelCase || isUpperCase,
          `Key "${key}" is not camelCase or UPPER_CASE`,
        ).toBe(true);
        return isCamelCase || isUpperCase;
      }),
      { numRuns: allKeyNames.length },
    );
  });

  /**
   * Property 7: Placeholder Syntax Validation
   * For any translation value that contains dynamic placeholders,
   * the placeholder SHALL use the {variableName} syntax (curly braces with camelCase variable name).
   */
  it("Property 7: all placeholders should use {variableName} syntax", () => {
    // Lấy tất cả translation values có chứa placeholders
    function getAllValuesWithPlaceholders(
      obj: MessageObject,
      prefix = "",
    ): { key: string; value: string; placeholders: string[] }[] {
      const results: { key: string; value: string; placeholders: string[] }[] =
        [];
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value)
        ) {
          results.push(
            ...getAllValuesWithPlaceholders(value as MessageObject, fullKey),
          );
        } else if (typeof value === "string") {
          // Tìm tất cả placeholders trong string
          const placeholderMatches = value.match(/\{[^}]+\}/g);
          if (placeholderMatches && placeholderMatches.length > 0) {
            results.push({
              key: fullKey,
              value,
              placeholders: placeholderMatches,
            });
          }
        }
      }
      return results;
    }

    // Regex cho valid placeholder: {camelCase} hoặc {UPPER_CASE}
    const validPlaceholderRegex = /^\{[a-z][a-zA-Z0-9]*\}$/;

    const allMessages = [
      { name: "en", messages: enMessages },
      { name: "vi", messages: viMessages },
      { name: "ja", messages: jaMessages },
    ];

    for (const { name, messages } of allMessages) {
      const valuesWithPlaceholders = getAllValuesWithPlaceholders(
        messages as MessageObject,
      );

      if (valuesWithPlaceholders.length === 0) continue;

      fc.assert(
        fc.property(
          fc.constantFrom(...valuesWithPlaceholders),
          ({ key, placeholders }) => {
            for (const placeholder of placeholders) {
              const isValid = validPlaceholderRegex.test(placeholder);
              expect(
                isValid,
                `Invalid placeholder "${placeholder}" in ${name}.json at key "${key}". Expected format: {camelCase}`,
              ).toBe(true);
              if (!isValid) return false;
            }
            return true;
          },
        ),
        { numRuns: valuesWithPlaceholders.length },
      );
    }
  });

  /**
   * Property 4: i18n Translation Completeness
   * For any supported locale (vi, en, ja), all translation keys used in the application
   * SHALL have corresponding translations in the message file.
   * Feature: attendance-payroll-frontend, Property 4: i18n Translation Completeness
   * Validates: Requirements 14.1, 14.2
   */
  it("Property 4: all attendance/payroll namespaces should exist in all locales", () => {
    // Các namespace mới cho attendance/payroll system
    const requiredNamespaces = ["attendance", "payroll", "schedules", "leave"];

    const allMessages = [
      { name: "en", messages: enMessages },
      { name: "vi", messages: viMessages },
      { name: "ja", messages: jaMessages },
    ];

    // Kiểm tra mỗi namespace tồn tại trong mỗi locale
    fc.assert(
      fc.property(
        fc.constantFrom(...allMessages),
        fc.constantFrom(...requiredNamespaces),
        ({ name, messages }, namespace) => {
          const hasNamespace = namespace in (messages as MessageObject);
          expect(
            hasNamespace,
            `Namespace "${namespace}" is missing in ${name}.json`,
          ).toBe(true);

          // Kiểm tra namespace không rỗng
          if (hasNamespace) {
            const namespaceContent = (messages as MessageObject)[namespace];
            const keys = Object.keys(namespaceContent as object);
            expect(
              keys.length,
              `Namespace "${namespace}" in ${name}.json should not be empty`,
            ).toBeGreaterThan(0);
          }

          return hasNamespace;
        },
      ),
      { numRuns: allMessages.length * requiredNamespaces.length },
    );
  });

  /**
   * Property 8: Enum Translation Completeness
   * For any enum type defined in types/enums.ts, all enum values SHALL have
   * corresponding translations in the enums namespace following the pattern enums.{enumName}.{enumValue}.
   */
  it("Property 8: all enum values should have translations", () => {
    // Định nghĩa tất cả enums cần kiểm tra
    const enumDefinitions = [
      { name: "depositStatus", values: DEPOSIT_STATUSES },
      { name: "transactionType", values: TRANSACTION_TYPES },
      { name: "userStatus", values: USER_STATUSES },
      { name: "commissionStatus", values: COMMISSION_STATUSES },
      { name: "gender", values: GENDERS },
      {
        name: "userRole",
        values: [...TAMABEE_USER_ROLES, ...COMPANY_USER_ROLES],
      },
      // Attendance/Payroll enums
      { name: "roundingInterval", values: ROUNDING_INTERVALS },
      { name: "roundingDirection", values: ROUNDING_DIRECTIONS },
      { name: "salaryType", values: SALARY_TYPES },
      { name: "attendanceStatus", values: ATTENDANCE_STATUSES },
      { name: "payrollPeriodStatus", values: PAYROLL_PERIOD_STATUSES },
      { name: "payrollItemStatus", values: PAYROLL_ITEM_STATUSES },
      { name: "paymentStatus", values: PAYMENT_STATUSES },
      { name: "adjustmentStatus", values: ADJUSTMENT_STATUSES },
      { name: "selectionStatus", values: SELECTION_STATUSES },
      { name: "scheduleType", values: SCHEDULE_TYPES },
      { name: "allowanceType", values: ALLOWANCE_TYPES },
      { name: "deductionType", values: DEDUCTION_TYPES },
      { name: "leaveType", values: LEAVE_TYPES },
      { name: "leaveStatus", values: LEAVE_STATUSES },
      { name: "breakType", values: BREAK_TYPES },
    ];

    // Tạo danh sách tất cả enum value cần kiểm tra
    const allEnumEntries: { enumName: string; enumValue: string }[] = [];
    for (const { name, values } of enumDefinitions) {
      for (const value of values) {
        allEnumEntries.push({ enumName: name, enumValue: value });
      }
    }

    const allMessages = [
      { name: "en", messages: enMessages },
      { name: "vi", messages: viMessages },
      { name: "ja", messages: jaMessages },
    ];

    // Hàm lấy giá trị từ nested object theo path
    function getNestedValue(obj: MessageObject, path: string): unknown {
      const parts = path.split(".");
      let current: unknown = obj;
      for (const part of parts) {
        if (current === null || current === undefined) return undefined;
        if (typeof current !== "object") return undefined;
        current = (current as Record<string, unknown>)[part];
      }
      return current;
    }

    for (const { name, messages } of allMessages) {
      fc.assert(
        fc.property(
          fc.constantFrom(...allEnumEntries),
          ({ enumName, enumValue }) => {
            const translationKey = `enums.${enumName}.${enumValue}`;
            const translation = getNestedValue(
              messages as MessageObject,
              translationKey,
            );

            expect(
              translation,
              `Missing translation for "${translationKey}" in ${name}.json`,
            ).toBeDefined();
            expect(
              typeof translation,
              `Translation for "${translationKey}" in ${name}.json should be a string`,
            ).toBe("string");
            expect(
              (translation as string).length,
              `Translation for "${translationKey}" in ${name}.json should not be empty`,
            ).toBeGreaterThan(0);

            return (
              translation !== undefined &&
              typeof translation === "string" &&
              translation.length > 0
            );
          },
        ),
        { numRuns: allEnumEntries.length },
      );
    }
  });
});
