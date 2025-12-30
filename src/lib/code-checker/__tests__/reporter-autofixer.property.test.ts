/**
 * Property-Based Tests cho Reporter và Auto-Fixer
 * Sử dụng fast-check để test các components với nhiều inputs ngẫu nhiên
 *
 * Feature: code-rules-checker
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fc from "fast-check";
import { ConsoleReporter } from "../reporter/console-reporter";
import { MarkdownReporter } from "../reporter/markdown-reporter";
import { AutoFixer } from "../auto-fixer/auto-fixer";
import { DiffGenerator } from "../auto-fixer/diff-generator";
import { FixApplier } from "../auto-fixer/fix-applier";
import type { Violation, RuleCategory, Severity, ProjectType } from "../types";

// ============================================
// GENERATORS
// ============================================

/**
 * Generator cho Severity
 */
const severityArb: fc.Arbitrary<Severity> = fc.constantFrom(
  "error",
  "warning",
  "info",
);

/**
 * Generator cho ProjectType
 */
const projectTypeArb: fc.Arbitrary<ProjectType> = fc.constantFrom(
  "frontend",
  "backend",
);

/**
 * Generator cho RuleCategory
 */
const ruleCategoryArb: fc.Arbitrary<RuleCategory> = fc.constantFrom(
  "navigation",
  "api-calls",
  "authentication",
  "components",
  "component-placement",
  "types",
  "tables",
  "statistics-cards",
  "image-upload",
  "performance",
  "i18n",
  "currency",
  "comments",
  "architecture",
  "exception-handling",
  "response",
  "transaction",
  "repository",
  "naming",
  "security",
  "entity",
  "mapper",
);

/**
 * Generator cho valid file paths
 */
const filePathArb = fc.oneof(
  fc.constant("src/components/test.tsx"),
  fc.constant("src/pages/dashboard.tsx"),
  fc.constant("src/lib/utils.ts"),
  fc.constant("src/main/java/com/example/Service.java"),
  fc.constant("src/main/java/com/example/Controller.java"),
);

/**
 * Generator cho rule IDs
 */
const ruleIdArb = fc.oneof(
  fc.constant("FE-NAV-001"),
  fc.constant("FE-TYPE-001"),
  fc.constant("FE-COMP-001"),
  fc.constant("FE-API-001"),
  fc.constant("BE-ARCH-001"),
  fc.constant("BE-TXN-001"),
  fc.constant("BE-CMT-001"),
);

/**
 * Generator cho code snippets
 */
const codeSnippetArb = fc.oneof(
  fc.constant('window.location.href = "/dashboard"'),
  fc.constant("const data: any = {}"),
  fc.constant('localStorage.getItem("token")'),
  fc.constant("public class UserService {"),
  fc.constant("// Requirements: 1.1"),
);

/**
 * Generator cho messages
 */
const messageArb = fc.string({ minLength: 5, maxLength: 100 });

/**
 * Generator cho suggestions
 */
const suggestionArb = fc.string({ minLength: 5, maxLength: 100 });

/**
 * Generator cho line numbers
 */
const lineNumberArb = fc.integer({ min: 1, max: 1000 });

/**
 * Generator cho column numbers
 */
const columnNumberArb = fc.integer({ min: 1, max: 200 });

/**
 * Generator cho Violation
 */
const violationArb: fc.Arbitrary<Violation> = fc.record({
  id: fc.string({ minLength: 5, maxLength: 50 }),
  ruleId: ruleIdArb,
  ruleName: fc.string({ minLength: 3, maxLength: 50 }),
  category: ruleCategoryArb,
  severity: severityArb,
  projectType: projectTypeArb,
  file: filePathArb,
  line: lineNumberArb,
  column: columnNumberArb,
  message: messageArb,
  suggestion: suggestionArb,
  codeSnippet: codeSnippetArb,
  canAutoFix: fc.boolean(),
  fixCode: fc.option(fc.string({ minLength: 1, maxLength: 100 }), {
    nil: undefined,
  }),
});

/**
 * Generator cho fixable Violation
 */
const fixableViolationArb: fc.Arbitrary<Violation> = fc.record({
  id: fc.string({ minLength: 5, maxLength: 50 }),
  ruleId: ruleIdArb,
  ruleName: fc.string({ minLength: 3, maxLength: 50 }),
  category: ruleCategoryArb,
  severity: severityArb,
  projectType: projectTypeArb,
  file: filePathArb,
  line: lineNumberArb,
  column: columnNumberArb,
  message: messageArb,
  suggestion: suggestionArb,
  codeSnippet: codeSnippetArb,
  canAutoFix: fc.constant(true),
  fixCode: fc.string({ minLength: 1, maxLength: 100 }),
});

/**
 * Generator cho non-fixable Violation
 */
const nonFixableViolationArb: fc.Arbitrary<Violation> = fc.record({
  id: fc.string({ minLength: 5, maxLength: 50 }),
  ruleId: ruleIdArb,
  ruleName: fc.string({ minLength: 3, maxLength: 50 }),
  category: ruleCategoryArb,
  severity: severityArb,
  projectType: projectTypeArb,
  file: filePathArb,
  line: lineNumberArb,
  column: columnNumberArb,
  message: messageArb,
  suggestion: suggestionArb,
  codeSnippet: codeSnippetArb,
  canAutoFix: fc.constant(false),
  fixCode: fc.constant(undefined),
});

/**
 * Generator cho array of violations
 */
const violationsArb = fc.array(violationArb, { minLength: 0, maxLength: 20 });

// ============================================
// PROPERTY TESTS
// ============================================

describe("Reporter và Auto-Fixer Property Tests", () => {
  /**
   * Property 28: Report Structure Validation
   * For any generated report, the Code_Rules_Checker SHALL include violations grouped
   * by file and category with line numbers and suggestions.
   * **Validates: Requirements 24.1, 24.2, 24.3, 24.4, 24.5**
   */
  describe("Property 28: Report Structure Validation", () => {
    let consoleReporter: ConsoleReporter;
    let markdownReporter: MarkdownReporter;

    beforeEach(() => {
      consoleReporter = new ConsoleReporter(false);
      markdownReporter = new MarkdownReporter();
    });

    it("should generate summary with correct total violations count", () => {
      fc.assert(
        fc.property(violationsArb, (violations) => {
          const summary = consoleReporter.generateSummary(violations);

          // Total violations phải bằng số violations đầu vào
          expect(summary.totalViolations).toBe(violations.length);
        }),
        { numRuns: 100 },
      );
    });

    it("should correctly count violations by severity", () => {
      fc.assert(
        fc.property(violationsArb, (violations) => {
          const summary = consoleReporter.generateSummary(violations);

          // Tổng by severity phải bằng total
          const severityTotal =
            summary.bySeverity.error +
            summary.bySeverity.warning +
            summary.bySeverity.info;

          expect(severityTotal).toBe(summary.totalViolations);
        }),
        { numRuns: 100 },
      );
    });

    it("should correctly count violations by project type", () => {
      fc.assert(
        fc.property(violationsArb, (violations) => {
          const summary = consoleReporter.generateSummary(violations);

          // Tổng by project phải bằng total
          const projectTotal =
            summary.byProject.frontend + summary.byProject.backend;

          expect(projectTotal).toBe(summary.totalViolations);
        }),
        { numRuns: 100 },
      );
    });

    it("should correctly count auto-fixable violations", () => {
      fc.assert(
        fc.property(violationsArb, (violations) => {
          const summary = consoleReporter.generateSummary(violations);

          // Auto-fixable count phải bằng số violations có canAutoFix = true
          const expectedAutoFixable = violations.filter(
            (v) => v.canAutoFix,
          ).length;

          expect(summary.autoFixable).toBe(expectedAutoFixable);
        }),
        { numRuns: 100 },
      );
    });

    it("should correctly count violations by category", () => {
      fc.assert(
        fc.property(violationsArb, (violations) => {
          const summary = consoleReporter.generateSummary(violations);

          // Tổng by category phải bằng total
          const categoryTotal = Object.values(summary.byCategory).reduce(
            (sum, count) => sum + (count || 0),
            0,
          );

          expect(categoryTotal).toBe(summary.totalViolations);
        }),
        { numRuns: 100 },
      );
    });

    it("should correctly count violations by file", () => {
      fc.assert(
        fc.property(violationsArb, (violations) => {
          const summary = consoleReporter.generateSummary(violations);

          // Tổng by file phải bằng total
          const fileTotal = Object.values(summary.byFile).reduce(
            (sum, count) => sum + count,
            0,
          );

          expect(fileTotal).toBe(summary.totalViolations);
        }),
        { numRuns: 100 },
      );
    });

    it("should generate markdown report containing all file paths", () => {
      fc.assert(
        fc.property(violationsArb, (violations) => {
          if (violations.length === 0) return true;

          const markdown = markdownReporter.generateMarkdownReport(violations);

          // Report phải chứa tất cả file paths
          const uniqueFiles = [...new Set(violations.map((v) => v.file))];
          for (const file of uniqueFiles) {
            expect(markdown).toContain(file);
          }
        }),
        { numRuns: 100 },
      );
    });

    it("should generate markdown report containing all rule IDs", () => {
      fc.assert(
        fc.property(violationsArb, (violations) => {
          if (violations.length === 0) return true;

          const markdown = markdownReporter.generateMarkdownReport(violations);

          // Report phải chứa tất cả rule IDs
          const uniqueRuleIds = [...new Set(violations.map((v) => v.ruleId))];
          for (const ruleId of uniqueRuleIds) {
            expect(markdown).toContain(ruleId);
          }
        }),
        { numRuns: 100 },
      );
    });

    it("should generate markdown report with line numbers", () => {
      fc.assert(
        fc.property(violationsArb, (violations) => {
          if (violations.length === 0) return true;

          const markdown = markdownReporter.generateMarkdownReport(violations);

          // Report phải chứa "Line" keyword cho mỗi violation
          for (const v of violations) {
            expect(markdown).toContain(`Line ${v.line}`);
          }
        }),
        { numRuns: 100 },
      );
    });

    it("should separate frontend and backend violations in markdown report", () => {
      fc.assert(
        fc.property(violationsArb, (violations) => {
          const markdown = markdownReporter.generateMarkdownReport(violations);

          const hasFrontend = violations.some(
            (v) => v.projectType === "frontend",
          );
          const hasBackend = violations.some(
            (v) => v.projectType === "backend",
          );

          // Report phải có section riêng cho frontend/backend nếu có violations
          if (hasFrontend) {
            expect(markdown).toContain("## Frontend Violations");
          }
          if (hasBackend) {
            expect(markdown).toContain("## Backend Violations");
          }
        }),
        { numRuns: 100 },
      );
    });

    it("should mark auto-fixable violations in markdown report", () => {
      fc.assert(
        fc.property(violationsArb, (violations) => {
          const markdown = markdownReporter.generateMarkdownReport(violations);

          const autoFixableCount = violations.filter(
            (v) => v.canAutoFix,
          ).length;

          // Report phải có [auto-fix] tag cho violations có canAutoFix = true
          if (autoFixableCount > 0) {
            expect(markdown).toContain("[auto-fix]");
          }
        }),
        { numRuns: 100 },
      );
    });

    it("should show success message for empty violations", () => {
      const markdown = markdownReporter.generateMarkdownReport([]);

      expect(markdown).toContain("No Violations Found");
    });

    it("should include summary table in markdown report", () => {
      fc.assert(
        fc.property(violationsArb, (violations) => {
          const markdown = markdownReporter.generateMarkdownReport(violations);

          // Report phải có summary section
          expect(markdown).toContain("## Summary");
          expect(markdown).toContain("| Metric | Count |");
          expect(markdown).toContain(
            `| Total Violations | ${violations.length} |`,
          );
        }),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 29: Auto-fix Functionality Validation
   * For any auto-fixable violation, the Code_Rules_Checker SHALL correctly apply fix
   * while preserving formatting.
   * **Validates: Requirements 25.1, 25.2, 25.3, 25.4**
   */
  describe("Property 29: Auto-fix Functionality Validation", () => {
    let autoFixer: AutoFixer;
    let diffGenerator: DiffGenerator;

    beforeEach(() => {
      autoFixer = new AutoFixer();
      diffGenerator = new DiffGenerator();
    });

    it("should correctly identify fixable violations count", () => {
      fc.assert(
        fc.property(violationsArb, (violations) => {
          const fixableCount = autoFixer.getFixableCount(violations);

          // Count phải bằng số violations có canAutoFix = true VÀ có fixCode
          const expectedCount = violations.filter(
            (v) => v.canAutoFix && v.fixCode,
          ).length;

          expect(fixableCount).toBe(expectedCount);
        }),
        { numRuns: 100 },
      );
    });

    it("should filter only fixable violations", () => {
      fc.assert(
        fc.property(violationsArb, (violations) => {
          const fixable = autoFixer.getFixableViolations(violations);

          // Tất cả violations trả về phải có canAutoFix = true và fixCode
          for (const v of fixable) {
            expect(v.canAutoFix).toBe(true);
            expect(v.fixCode).toBeDefined();
          }
        }),
        { numRuns: 100 },
      );
    });

    it("should return empty array when no fixable violations", () => {
      fc.assert(
        fc.property(
          fc.array(nonFixableViolationArb, { minLength: 0, maxLength: 10 }),
          (violations) => {
            const fixable = autoFixer.getFixableViolations(violations);

            expect(fixable.length).toBe(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("should generate diff with correct file path", () => {
      fc.assert(
        fc.property(fixableViolationArb, lineNumberArb, (violation, line) => {
          // Tạo content với đủ số dòng
          const lines = Array(Math.max(line + 5, 10))
            .fill("// line of code")
            .join("\n");

          const adjustedViolation = { ...violation, line: Math.min(line, 5) };
          const diff = diffGenerator.generateDiff(lines, adjustedViolation);

          expect(diff.file).toBe(adjustedViolation.file);
        }),
        { numRuns: 100 },
      );
    });

    it("should generate diff with line changes for fixable violations", () => {
      fc.assert(
        fc.property(fixableViolationArb, (violation) => {
          const content = `line1
line2
${violation.codeSnippet}
line4
line5`;

          const adjustedViolation = { ...violation, line: 3 };
          const diff = diffGenerator.generateDiff(content, adjustedViolation);

          // Diff phải có line changes
          expect(diff.lineChanges.length).toBeGreaterThan(0);
          expect(diff.lineChanges[0].line).toBe(3);
        }),
        { numRuns: 100 },
      );
    });

    it("should return empty line changes for non-fixable violations", () => {
      fc.assert(
        fc.property(nonFixableViolationArb, (violation) => {
          const content = "const x = 1;";
          const diff = diffGenerator.generateDiff(content, violation);

          expect(diff.lineChanges.length).toBe(0);
        }),
        { numRuns: 100 },
      );
    });

    it("should format diff for console with correct structure", () => {
      fc.assert(
        fc.property(fixableViolationArb, (violation) => {
          const diff = {
            file: violation.file,
            before: "old content",
            after: "new content",
            lineChanges: [
              { line: 1, oldContent: "old line", newContent: "new line" },
            ],
          };

          const formatted = diffGenerator.formatDiffForConsole(diff, false);

          // Console diff phải có --- và +++
          expect(formatted).toContain("---");
          expect(formatted).toContain("+++");
          expect(formatted).toContain("old line");
          expect(formatted).toContain("new line");
        }),
        { numRuns: 100 },
      );
    });

    it("should format diff for markdown with correct structure", () => {
      fc.assert(
        fc.property(fixableViolationArb, (violation) => {
          const diff = {
            file: violation.file,
            before: "old content",
            after: "new content",
            lineChanges: [
              { line: 5, oldContent: "old line", newContent: "new line" },
            ],
          };

          const formatted = diffGenerator.formatDiffForMarkdown(diff);

          // Markdown diff phải có đúng format
          expect(formatted).toContain(`**File:** \`${violation.file}\``);
          expect(formatted).toContain("```diff");
          expect(formatted).toContain("- old line");
          expect(formatted).toContain("+ new line");
          expect(formatted).toContain("@@ Line 5 @@");
        }),
        { numRuns: 100 },
      );
    });

    it("should generate unified diff with context lines", () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 3 }), (contextLines) => {
          const diff = {
            file: "test.tsx",
            before: "line1\nline2\nline3\nline4\nline5\nline6\nline7",
            after: "line1\nline2\nmodified\nline4\nline5\nline6\nline7",
            lineChanges: [
              { line: 3, oldContent: "line3", newContent: "modified" },
            ],
          };

          const unified = diffGenerator.generateUnifiedDiff(diff, contextLines);

          // Unified diff phải có header
          expect(unified).toContain("--- a/test.tsx");
          expect(unified).toContain("+++ b/test.tsx");
          expect(unified).toContain("-line3");
          expect(unified).toContain("+modified");
        }),
        { numRuns: 100 },
      );
    });

    it("should preserve original content when violation has no fixCode", () => {
      fc.assert(
        fc.property(nonFixableViolationArb, (violation) => {
          const originalContent = "const x = 1;\nconst y = 2;";
          const diff = diffGenerator.generateDiff(originalContent, violation);

          // Before và after phải giống nhau khi không có fixCode
          expect(diff.before).toBe(originalContent);
          expect(diff.after).toBe(originalContent);
        }),
        { numRuns: 100 },
      );
    });

    it("should handle violations with invalid line numbers gracefully", () => {
      fc.assert(
        fc.property(fixableViolationArb, (violation) => {
          const content = "single line";
          const invalidViolation = { ...violation, line: 100 };

          const diff = diffGenerator.generateDiff(content, invalidViolation);

          // Phải trả về empty line changes cho invalid line
          expect(diff.lineChanges.length).toBe(0);
        }),
        { numRuns: 100 },
      );
    });
  });
});
