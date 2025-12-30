/**
 * Type Rules (FE-TYPE-001, FE-TYPE-002)
 * Check TypeScript types are used correctly
 */

import { BaseRule } from "../../interfaces/rule";
import type { ParsedFile, RuleContext, Violation } from "../../types";

/**
 * FE-TYPE-001: No any type
 * Detect usage of 'any' type and flag as Error
 */
export class AnyTypeRule extends BaseRule {
  id = "FE-TYPE-001";
  name = "No any type";
  category = "types" as const;
  severity = "error" as const;
  description = "Do not use any type, define proper types in types/ directory";
  projectType = "frontend" as const;
  canAutoFix = false;

  check(file: ParsedFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Patterns to detect 'any' type - using exact word boundary
    const anyPatterns = [
      /:\s*any(?![a-zA-Z])/g,
      /<any>(?![a-zA-Z])/g,
      /<any,/g,
      /,\s*any>(?![a-zA-Z])/g,
      /as\s+any(?![a-zA-Z])/g,
      /(?<![a-zA-Z])any\[\]/g,
    ];

    for (let i = 0; i < file.lines.length; i++) {
      const line = file.lines[i];

      // Skip comments
      if (line.trim().startsWith("//") || line.trim().startsWith("*")) {
        continue;
      }

      // Skip if line contains "company" or "many" (false positives)
      if (/\bcompany\b/i.test(line) || /\bmany\b/i.test(line)) {
        // But still check if there's `: any` or `as any` separately
        const hasTypeAny =
          /:\s*any(?![a-zA-Z])/.test(line) || /as\s+any(?![a-zA-Z])/.test(line);
        if (!hasTypeAny) {
          continue;
        }
      }

      for (const pattern of anyPatterns) {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          violations.push(
            this.createViolation({
              file: file.file.relativePath,
              line: i + 1,
              column: match.index + 1,
              message: `Using 'any' type: ${match[0].trim()}`,
              suggestion: "Define proper type in types/ directory",
              codeSnippet: line.trim(),
            }),
          );
        }
        pattern.lastIndex = 0;
      }
    }

    return violations;
  }
}

/**
 * FE-TYPE-002: Import enums from types/enums.ts
 * Verify enums are imported from types/enums.ts
 */
export class EnumImportRule extends BaseRule {
  id = "FE-TYPE-002";
  name = "Import enums from types/enums.ts";
  category = "types" as const;
  severity = "warning" as const;
  description = "Enums must be imported from types/enums.ts";
  projectType = "frontend" as const;
  canAutoFix = true;

  // List of enums to check
  private readonly knownEnums = [
    "UserRole",
    "UserStatus",
    "TransactionType",
    "DepositStatus",
    "PlanType",
    "PaymentStatus",
  ];

  check(file: ParsedFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Skip enums.ts file
    if (file.file.relativePath.includes("enums.ts")) {
      return violations;
    }

    // Find enums used in file
    for (const enumName of this.knownEnums) {
      const enumPattern = new RegExp(`\\b${enumName}\\b`, "g");

      // Check if enum is used
      if (!enumPattern.test(file.content)) {
        continue;
      }

      // Check if imported from types/enums.ts
      const hasCorrectImport = file.imports.some(
        (imp) =>
          (imp.source.includes("types/enums") ||
            imp.source.includes("@/types/enums")) &&
          imp.namedImports.includes(enumName),
      );

      if (!hasCorrectImport) {
        // Find first line using enum
        for (let i = 0; i < file.lines.length; i++) {
          const line = file.lines[i];
          if (enumPattern.test(line) && !line.includes("import")) {
            violations.push(
              this.createViolation({
                file: file.file.relativePath,
                line: i + 1,
                column: 1,
                message: `Enum '${enumName}' not imported from types/enums.ts`,
                suggestion: `Add import { ${enumName} } from '@/types/enums'`,
                codeSnippet: line.trim(),
                fixCode: `import { ${enumName} } from '@/types/enums';`,
              }),
            );
            break;
          }
          enumPattern.lastIndex = 0;
        }
      }
    }

    // Check hardcoded enum values
    const hardcodedEnumPatterns = [
      { pattern: /['"]ADMIN_TAMABEE['"]/g, enum: "UserRole" },
      { pattern: /['"]ADMIN_COMPANY['"]/g, enum: "UserRole" },
      { pattern: /['"]MANAGER_COMPANY['"]/g, enum: "UserRole" },
      { pattern: /['"]EMPLOYEE_COMPANY['"]/g, enum: "UserRole" },
      { pattern: /['"]ACTIVE['"]/g, enum: "UserStatus" },
      { pattern: /['"]INACTIVE['"]/g, enum: "UserStatus" },
      { pattern: /['"]PENDING['"]/g, enum: "DepositStatus/UserStatus" },
      { pattern: /['"]APPROVED['"]/g, enum: "DepositStatus" },
      { pattern: /['"]REJECTED['"]/g, enum: "DepositStatus" },
    ];

    for (let i = 0; i < file.lines.length; i++) {
      const line = file.lines[i];

      // Skip comments and imports
      if (
        line.trim().startsWith("//") ||
        line.trim().startsWith("*") ||
        line.includes("import")
      ) {
        continue;
      }

      for (const { pattern, enum: enumName } of hardcodedEnumPatterns) {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          // Skip if in object key or type definition
          const beforeMatch = line.substring(0, match.index);
          if (beforeMatch.endsWith(":") || beforeMatch.includes("type ")) {
            continue;
          }

          violations.push(
            this.createViolation({
              file: file.file.relativePath,
              line: i + 1,
              column: match.index + 1,
              message: `Hardcoded enum value: ${match[0]}`,
              suggestion: `Use constant from ${enumName} enum in types/enums.ts`,
              codeSnippet: line.trim(),
            }),
          );
        }
        pattern.lastIndex = 0;
      }
    }

    return violations;
  }
}
