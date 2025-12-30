/**
 * Comment Rules (FE-CMT-001)
 * Check comments compliance with guidelines
 */

import { BaseRule } from "../../interfaces/rule";
import type {
  ParsedFile,
  RuleContext,
  Violation,
  FixResult,
} from "../../types";

/**
 * FE-CMT-001: No requirement comments
 * Detect "Requirements" or "Validates: Requirements" text in comments
 */
export class RequirementCommentRule extends BaseRule {
  id = "FE-CMT-001";
  name = "No requirement comments";
  category = "comments" as const;
  severity = "warning" as const;
  description =
    'Do not comment "Requirements" or "Validates: Requirements" in code';
  projectType = "frontend" as const;
  canAutoFix = true;

  // Patterns to detect requirement comments
  private readonly requirementPatterns = [
    /Requirements?\s*:/i,
    /Validates?\s*:\s*Requirements?/i,
    /\*\*Validates:\s*Requirements/i,
    /@see\s+Requirements?/i,
    /Requirement\s+\d+/i,
    /Req\s*#?\d+/i,
  ];

  check(file: ParsedFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    for (let i = 0; i < file.lines.length; i++) {
      const line = file.lines[i];

      // Check if it's a comment line
      const isComment =
        line.trim().startsWith("//") ||
        line.trim().startsWith("*") ||
        line.trim().startsWith("/*");

      if (!isComment) continue;

      for (const pattern of this.requirementPatterns) {
        if (pattern.test(line)) {
          violations.push(
            this.createViolation({
              file: file.file.relativePath,
              line: i + 1,
              column: 1,
              message:
                'Comment contains "Requirements" or "Validates: Requirements"',
              suggestion:
                "Remove this comment - should not reference requirements in code",
              codeSnippet: line.trim(),
              fixCode: "", // Empty string = remove line
            }),
          );
          break;
        }
      }
    }

    return violations;
  }

  fix(file: ParsedFile, violation: Violation): FixResult {
    const lineIndex = violation.line - 1;
    const line = file.lines[lineIndex];

    // If single line comment, remove entire line
    if (line.trim().startsWith("//")) {
      file.lines.splice(lineIndex, 1);
    }
    // If block comment line, remove that line
    else if (line.trim().startsWith("*") && !line.trim().startsWith("*/")) {
      // Check if it's the only line in block comment
      const prevLine = file.lines[lineIndex - 1]?.trim();
      const nextLine = file.lines[lineIndex + 1]?.trim();

      if (prevLine === "/*" && nextLine === "*/") {
        // Remove entire block comment
        file.lines.splice(lineIndex - 1, 3);
      } else {
        // Only remove this line
        file.lines.splice(lineIndex, 1);
      }
    }
    // If inline block comment /* ... */
    else if (line.includes("/*") && line.includes("*/")) {
      // Remove comment part
      const newLine = line.replace(/\/\*[^*]*\*+([^/*][^*]*\*+)*\//, "").trim();
      if (newLine) {
        file.lines[lineIndex] = newLine;
      } else {
        file.lines.splice(lineIndex, 1);
      }
    }

    file.content = file.lines.join("\n");
    file.lineCount = file.lines.length;

    return {
      success: true,
      file: file.file.relativePath,
      violation,
    };
  }
}
