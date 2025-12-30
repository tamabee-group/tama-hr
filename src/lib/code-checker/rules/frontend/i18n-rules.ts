/**
 * i18n Rules (FE-I18N-001, FE-I18N-002)
 * Check internationalization is implemented correctly
 */

import { BaseRule } from "../../interfaces/rule";
import type { ParsedFile, RuleContext, Violation } from "../../types";

/**
 * FE-I18N-001: No hardcoded strings
 * Detect hardcoded text strings in UI
 */
export class HardcodedStringRule extends BaseRule {
  id = "FE-I18N-001";
  name = "No hardcoded strings";
  category = "i18n" as const;
  severity = "warning" as const;
  description = "Do not hardcode text strings in UI, use translations";
  projectType = "frontend" as const;
  canAutoFix = false;

  // Patterns to exclude (not UI text)
  private readonly excludePatterns = [
    /className/,
    /style/,
    /href/,
    /src/,
    /alt/,
    /type/,
    /name/,
    /id/,
    /key/,
    /data-/,
    /aria-/,
    /role/,
    /placeholder/, // Placeholder also needs i18n but handled separately
    /console\./,
    /import/,
    /export/,
    /from/,
    /require/,
  ];

  // Vietnamese/Japanese/English text patterns
  private readonly textPatterns = [
    // Vietnamese with diacritics
    /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i,
    // Japanese
    /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/,
    // Common UI text patterns (English)
    />\s*(Submit|Cancel|Save|Delete|Edit|Add|Create|Update|Search|Filter|Loading|Error|Success|Warning|Confirm|Close|Open|Back|Next|Previous)\s*</i,
  ];

  check(file: ParsedFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Only check component files
    if (!file.file.isComponent && !file.file.isPage) {
      return violations;
    }

    // Skip non-TSX files
    if (file.file.type !== "tsx") {
      return violations;
    }

    // Check if useTranslations is used
    const usesTranslations =
      file.content.includes("useTranslations") ||
      file.content.includes("t(") ||
      file.content.includes("t`");

    // Pattern to find text in JSX
    const jsxTextPattern = />\s*([^<>{}\n]+)\s*</g;

    for (let i = 0; i < file.lines.length; i++) {
      const line = file.lines[i];

      // Skip comments
      if (line.trim().startsWith("//") || line.trim().startsWith("*")) {
        continue;
      }

      // Skip imports
      if (line.includes("import ") || line.includes("from ")) {
        continue;
      }

      // Check exclude patterns
      let shouldExclude = false;
      for (const pattern of this.excludePatterns) {
        if (pattern.test(line)) {
          shouldExclude = true;
          break;
        }
      }
      if (shouldExclude) continue;

      // Find text in JSX
      let match;
      while ((match = jsxTextPattern.exec(line)) !== null) {
        const text = match[1].trim();

        // Skip empty text or whitespace only
        if (!text || /^\s*$/.test(text)) continue;

        // Skip if it's an expression {something}
        if (text.startsWith("{") || text.endsWith("}")) continue;

        // Skip if only numbers or special chars
        if (/^[\d\s.,\-+%$¥€£:\/]+$/.test(text)) continue;

        // Check if text needs i18n
        let needsI18n = false;
        for (const pattern of this.textPatterns) {
          if (pattern.test(text)) {
            needsI18n = true;
            break;
          }
        }

        // Check if it's long English text (might be UI text)
        if (!needsI18n && text.length > 3 && /[a-zA-Z]{3,}/.test(text)) {
          // Skip technical terms
          const technicalTerms = [
            "null",
            "undefined",
            "true",
            "false",
            "px",
            "rem",
            "em",
            "vh",
            "vw",
          ];
          if (!technicalTerms.some((term) => text.toLowerCase() === term)) {
            needsI18n = true;
          }
        }

        if (needsI18n && !usesTranslations) {
          violations.push(
            this.createViolation({
              file: file.file.relativePath,
              line: i + 1,
              column: match.index + 1,
              message: `Hardcoded text: "${text.substring(0, 50)}${text.length > 50 ? "..." : ""}"`,
              suggestion: "Use useTranslations() hook and translation keys",
              codeSnippet: line.trim(),
            }),
          );
        }
      }
      jsxTextPattern.lastIndex = 0;
    }

    return violations;
  }
}

/**
 * FE-I18N-002: Use useTranslations hook
 * Verify useTranslations() hook is used
 */
export class UseTranslationsRule extends BaseRule {
  id = "FE-I18N-002";
  name = "Use useTranslations";
  category = "i18n" as const;
  severity = "warning" as const;
  description = "Use useTranslations() hook for translations";
  projectType = "frontend" as const;
  canAutoFix = false;

  check(file: ParsedFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Only check client components
    if (!file.hasUseClient) {
      return violations;
    }

    // Only check component files
    if (!file.file.isComponent && !file.file.isPage) {
      return violations;
    }

    // Check if has text content (might need translations)
    const hasTextContent =
      file.content.includes(">{") || // JSX text
      file.content.includes(">") || // JSX elements
      file.content.includes("label") ||
      file.content.includes("title") ||
      file.content.includes("placeholder");

    if (!hasTextContent) {
      return violations;
    }

    // Check if useTranslations is imported
    const hasTranslationsImport = file.imports.some(
      (imp) =>
        imp.source.includes("next-intl") &&
        imp.namedImports.includes("useTranslations"),
    );

    // Check if useTranslations is used
    const usesTranslations = file.content.includes("useTranslations(");

    if (!hasTranslationsImport && !usesTranslations) {
      // Only flag if has Vietnamese/Japanese text
      const hasNonEnglishText =
        /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(
          file.content,
        ) || /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(file.content);

      if (hasNonEnglishText) {
        violations.push(
          this.createViolation({
            file: file.file.relativePath,
            line: 1,
            column: 1,
            message:
              "Component has text content but does not use useTranslations()",
            suggestion: "Import and use useTranslations() from 'next-intl'",
            codeSnippet: "// Component without useTranslations",
          }),
        );
      }
    }

    return violations;
  }
}
