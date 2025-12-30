/**
 * Currency Rules (FE-CURR-001)
 * Check currency formatting is implemented correctly
 */

import { BaseRule } from "../../interfaces/rule";
import type { ParsedFile, RuleContext, Violation } from "../../types";

/**
 * FE-CURR-001: Use formatCurrency
 * Verify formatCurrency() from @/lib/utils/format-currency is used with JPY locale
 */
export class FormatCurrencyRule extends BaseRule {
  id = "FE-CURR-001";
  name = "Use formatCurrency";
  category = "currency" as const;
  severity = "warning" as const;
  description =
    "Use formatCurrency() from @/lib/utils/format-currency with JPY locale";
  projectType = "frontend" as const;
  canAutoFix = false;

  check(file: ParsedFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Patterns to detect currency values
    const currencyPatterns = [
      /\b(price|amount|total|balance|cost|fee|salary|wage|payment|money|yen|jpy)\b/i,
      /¥\s*\d/,
      /\d+\s*円/,
      /toLocaleString\s*\(\s*['"]ja/i,
      /Intl\.NumberFormat\s*\(\s*['"]ja/i,
    ];

    // Check if file has currency-related content
    let hasCurrencyContent = false;
    let currencyLine = -1;

    for (let i = 0; i < file.lines.length; i++) {
      const line = file.lines[i];
      for (const pattern of currencyPatterns) {
        if (pattern.test(line)) {
          hasCurrencyContent = true;
          currencyLine = i + 1;
          break;
        }
      }
      if (hasCurrencyContent) break;
    }

    if (!hasCurrencyContent) {
      return violations;
    }

    // Check if formatCurrency is imported
    const hasFormatCurrencyImport = file.imports.some(
      (imp) =>
        imp.source.includes("format-currency") &&
        (imp.namedImports.includes("formatCurrency") ||
          imp.defaultImport === "formatCurrency"),
    );

    // Check if formatCurrency is used
    const usesFormatCurrency = file.content.includes("formatCurrency(");

    // Patterns to detect manual currency formatting
    const manualFormattingPatterns = [
      /\.toLocaleString\s*\(\s*['"]ja-JP['"]/g,
      /Intl\.NumberFormat\s*\(\s*['"]ja-JP['"]/g,
      /\.toFixed\s*\(\s*\d+\s*\)/g, // .toFixed() for currency
      /\$\{[^}]*\}円/g, // Template literal with 円
      /\+\s*['"]円['"]/g, // Concatenation with 円
    ];

    for (let i = 0; i < file.lines.length; i++) {
      const line = file.lines[i];

      // Skip comments
      if (line.trim().startsWith("//") || line.trim().startsWith("*")) {
        continue;
      }

      for (const pattern of manualFormattingPatterns) {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          // Skip if already using formatCurrency
          if (usesFormatCurrency && hasFormatCurrencyImport) {
            continue;
          }

          violations.push(
            this.createViolation({
              file: file.file.relativePath,
              line: i + 1,
              column: match.index + 1,
              message: `Manual currency formatting: ${match[0]}`,
              suggestion:
                "Use formatCurrency() from @/lib/utils/format-currency",
              codeSnippet: line.trim(),
            }),
          );
        }
        pattern.lastIndex = 0;
      }
    }

    // If has currency content but doesn't use formatCurrency
    if (!hasFormatCurrencyImport && !usesFormatCurrency) {
      // Check if displays currency (not just variable names)
      const displaysCurrency =
        file.content.includes("¥") ||
        file.content.includes("円") ||
        /\{[^}]*(price|amount|total|balance)[^}]*\}/i.test(file.content);

      if (displaysCurrency) {
        violations.push(
          this.createViolation({
            file: file.file.relativePath,
            line: currencyLine,
            column: 1,
            message: "File displays currency but does not use formatCurrency()",
            suggestion:
              "Import and use formatCurrency() from @/lib/utils/format-currency",
            codeSnippet: file.lines[currencyLine - 1]?.trim() || "",
          }),
        );
      }
    }

    return violations;
  }
}
