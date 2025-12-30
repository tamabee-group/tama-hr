/**
 * Comment Rules (BE-CMT-001, BE-CMT-002, BE-CMT-003)
 * Check comments compliance with rules
 */

import { BaseRule } from "../../interfaces/rule";
import type { ParsedJavaFile, RuleContext, Violation } from "../../types";

/**
 * BE-CMT-001: Vietnamese comments
 * Verify comments are written in Vietnamese
 */
export class VietnameseCommentsRule extends BaseRule {
  id = "BE-CMT-001";
  name = "Vietnamese comments";
  category = "comments" as const;
  severity = "info" as const;
  description = "Comments MUST be written in Vietnamese";
  projectType = "backend" as const;
  canAutoFix = false;

  check(file: ParsedJavaFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Vietnamese character pattern
    const vietnamesePattern =
      /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

    // English-only pattern (no Vietnamese characters)
    const englishOnlyPattern =
      /^[a-zA-Z0-9\s\.,;:!?\-_'"(){}[\]@#$%^&*+=<>/\\|`~]+$/;

    for (const comment of file.comments) {
      const content = comment.content.trim();

      // Skip short comments (may be code markers)
      if (content.length < 10) continue;

      // Skip Javadoc tags
      if (
        content.startsWith("@param") ||
        content.startsWith("@return") ||
        content.startsWith("@throws") ||
        content.startsWith("@see") ||
        content.startsWith("@author") ||
        content.startsWith("@version") ||
        content.startsWith("@since") ||
        content.startsWith("@deprecated")
      ) {
        continue;
      }

      // Skip TODO, FIXME, NOTE comments
      if (
        content.toUpperCase().startsWith("TODO") ||
        content.toUpperCase().startsWith("FIXME") ||
        content.toUpperCase().startsWith("NOTE") ||
        content.toUpperCase().startsWith("HACK") ||
        content.toUpperCase().startsWith("XXX")
      ) {
        continue;
      }

      // Check if comment is English-only (no Vietnamese)
      if (
        englishOnlyPattern.test(content) &&
        !vietnamesePattern.test(content)
      ) {
        // Only warn for long comments (likely documentation)
        if (content.length > 30) {
          violations.push(
            this.createViolation({
              file: file.file.relativePath,
              line: comment.line,
              message: "Comment appears to be written in English",
              suggestion: "Write comments in Vietnamese to ensure consistency",
              codeSnippet:
                content.substring(0, 50) + (content.length > 50 ? "..." : ""),
            }),
          );
        }
      }
    }

    return violations;
  }
}

/**
 * BE-CMT-002: No requirement comments
 * Verify no "Requirements" or "Validates: Requirements" in comments
 */
export class NoRequirementCommentsRule extends BaseRule {
  id = "BE-CMT-002";
  name = "No requirement comments";
  category = "comments" as const;
  severity = "warning" as const;
  description =
    'Do NOT comment "Requirements" or "Validates: Requirements" in code';
  projectType = "backend" as const;
  canAutoFix = true;

  check(file: ParsedJavaFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Pattern to detect requirement comments
    const requirementPatterns = [
      /Requirements?\s*:/i,
      /Validates?\s*:\s*Requirements?/i,
      /\*\*\s*Validates?\s*:/i,
    ];

    for (const comment of file.comments) {
      const content = comment.content;

      for (const pattern of requirementPatterns) {
        if (pattern.test(content)) {
          violations.push(
            this.createViolation({
              file: file.file.relativePath,
              line: comment.line,
              endLine: comment.endLine,
              message:
                'Comment contains "Requirements" or "Validates: Requirements"',
              suggestion: "Remove requirement comments from code",
              codeSnippet:
                content.substring(0, 50) + (content.length > 50 ? "..." : ""),
              fixCode: "", // Remove the comment
            }),
          );
          break;
        }
      }
    }

    return violations;
  }
}

/**
 * BE-CMT-003: No @Label annotation
 * Verify no @Label annotation in property tests
 */
export class NoLabelAnnotationRule extends BaseRule {
  id = "BE-CMT-003";
  name = "No @Label annotation";
  category = "comments" as const;
  severity = "warning" as const;
  description = "Do NOT use @Label annotation in property tests";
  projectType = "backend" as const;
  canAutoFix = true;

  check(file: ParsedJavaFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Only check test files
    if (
      !file.file.relativePath.includes("test") &&
      !file.file.relativePath.includes("Test")
    ) {
      return violations;
    }

    // Pattern to detect @Label annotation
    const labelPattern = /@Label\s*\(/g;

    for (let i = 0; i < file.lines.length; i++) {
      const line = file.lines[i];
      let match;

      while ((match = labelPattern.exec(line)) !== null) {
        violations.push(
          this.createViolation({
            file: file.file.relativePath,
            line: i + 1,
            column: match.index + 1,
            message: "Using @Label annotation in property test",
            suggestion: "Remove @Label annotation",
            codeSnippet: line.trim(),
            fixCode: line.replace(/@Label\s*\([^)]*\)\s*/, ""),
          }),
        );
      }

      // Reset regex lastIndex
      labelPattern.lastIndex = 0;
    }

    return violations;
  }
}
