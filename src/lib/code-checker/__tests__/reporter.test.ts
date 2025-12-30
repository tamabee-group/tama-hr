/**
 * Unit tests cho Reporter
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConsoleReporter } from "../reporter/console-reporter";
import { MarkdownReporter } from "../reporter/markdown-reporter";
import type { Violation } from "../types";

// Sample violations for testing
const createSampleViolations = (): Violation[] => [
  {
    id: "FE-NAV-001-test.tsx-10",
    ruleId: "FE-NAV-001",
    ruleName: "No window.location.href",
    category: "navigation",
    severity: "error",
    projectType: "frontend",
    file: "src/components/test.tsx",
    line: 10,
    column: 5,
    message: "Avoid using window.location.href",
    suggestion: "Use router.push() from next/navigation",
    codeSnippet: 'window.location.href = "/dashboard"',
    canAutoFix: true,
    fixCode: 'router.push("/dashboard")',
  },
  {
    id: "FE-TYPE-001-test.tsx-20",
    ruleId: "FE-TYPE-001",
    ruleName: "No any type",
    category: "types",
    severity: "error",
    projectType: "frontend",
    file: "src/components/test.tsx",
    line: 20,
    column: 10,
    message: "Avoid using any type",
    suggestion: "Define proper types in types/ directory",
    codeSnippet: "const data: any = {}",
    canAutoFix: false,
  },
  {
    id: "BE-ARCH-001-Service.java-15",
    ruleId: "BE-ARCH-001",
    ruleName: "Service interface pattern",
    category: "architecture",
    severity: "error",
    projectType: "backend",
    file: "src/main/java/com/example/Service.java",
    line: 15,
    column: 1,
    message: "Service must implement interface",
    suggestion: "Create IService interface",
    codeSnippet: "public class UserService {",
    canAutoFix: false,
  },
  {
    id: "FE-COMP-001-large.tsx-300",
    ruleId: "FE-COMP-001",
    ruleName: "Max 250 lines per component",
    category: "components",
    severity: "warning",
    projectType: "frontend",
    file: "src/components/large.tsx",
    line: 1,
    column: 1,
    message: "Component exceeds 250 lines (300 lines)",
    suggestion: "Split into smaller components",
    codeSnippet: "export function LargeComponent() {",
    canAutoFix: false,
  },
  {
    id: "BE-CMT-002-Test.java-5",
    ruleId: "BE-CMT-002",
    ruleName: "No requirement comments",
    category: "comments",
    severity: "warning",
    projectType: "backend",
    file: "src/main/java/com/example/Test.java",
    line: 5,
    column: 1,
    message: "Remove requirement comments",
    suggestion: 'Delete comments containing "Requirements"',
    codeSnippet: "// Requirements: 1.1",
    canAutoFix: true,
    fixCode: "",
  },
];

describe("ConsoleReporter", () => {
  let reporter: ConsoleReporter;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    reporter = new ConsoleReporter(false); // Disable colors for testing
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("should generate summary correctly", () => {
    const violations = createSampleViolations();
    const summary = reporter.generateSummary(violations);

    expect(summary.totalViolations).toBe(5);
    expect(summary.byProject.frontend).toBe(3);
    expect(summary.byProject.backend).toBe(2);
    expect(summary.bySeverity.error).toBe(3);
    expect(summary.bySeverity.warning).toBe(2);
    expect(summary.bySeverity.info).toBe(0);
    expect(summary.autoFixable).toBe(2);
  });

  it("should count violations by category", () => {
    const violations = createSampleViolations();
    const summary = reporter.generateSummary(violations);

    expect(summary.byCategory["navigation"]).toBe(1);
    expect(summary.byCategory["types"]).toBe(1);
    expect(summary.byCategory["architecture"]).toBe(1);
    expect(summary.byCategory["components"]).toBe(1);
    expect(summary.byCategory["comments"]).toBe(1);
  });

  it("should count violations by file", () => {
    const violations = createSampleViolations();
    const summary = reporter.generateSummary(violations);

    expect(summary.byFile["src/components/test.tsx"]).toBe(2);
    expect(summary.byFile["src/components/large.tsx"]).toBe(1);
    expect(summary.byFile["src/main/java/com/example/Service.java"]).toBe(1);
    expect(summary.byFile["src/main/java/com/example/Test.java"]).toBe(1);
  });

  it("should handle empty violations", () => {
    const summary = reporter.generateSummary([]);

    expect(summary.totalViolations).toBe(0);
    expect(summary.byProject.frontend).toBe(0);
    expect(summary.byProject.backend).toBe(0);
    expect(summary.autoFixable).toBe(0);
  });

  it("should generate console report without errors", () => {
    const violations = createSampleViolations();

    expect(() => {
      reporter.generateConsoleReport(violations);
    }).not.toThrow();

    expect(consoleSpy).toHaveBeenCalled();
  });

  it("should show success message for no violations", () => {
    reporter.generateConsoleReport([]);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("No violations found"),
    );
  });
});

describe("MarkdownReporter", () => {
  let reporter: MarkdownReporter;

  beforeEach(() => {
    reporter = new MarkdownReporter();
  });

  it("should generate markdown report with header", () => {
    const violations = createSampleViolations();
    const markdown = reporter.generateMarkdownReport(violations);

    expect(markdown).toContain("# Code Rules Checker Report");
    expect(markdown).toContain("Generated:");
  });

  it("should include summary table", () => {
    const violations = createSampleViolations();
    const markdown = reporter.generateMarkdownReport(violations);

    expect(markdown).toContain("## Summary");
    expect(markdown).toContain("| Metric | Count |");
    expect(markdown).toContain("| Total Violations | 5 |");
    expect(markdown).toContain("| 🔴 Errors | 3 |");
    expect(markdown).toContain("| 🟡 Warnings | 2 |");
  });

  it("should separate frontend and backend violations", () => {
    const violations = createSampleViolations();
    const markdown = reporter.generateMarkdownReport(violations);

    expect(markdown).toContain("## Frontend Violations");
    expect(markdown).toContain("## Backend Violations");
  });

  it("should include file paths", () => {
    const violations = createSampleViolations();
    const markdown = reporter.generateMarkdownReport(violations);

    expect(markdown).toContain("src/components/test.tsx");
    expect(markdown).toContain("src/main/java/com/example/Service.java");
  });

  it("should include line numbers", () => {
    const violations = createSampleViolations();
    const markdown = reporter.generateMarkdownReport(violations);

    expect(markdown).toContain("Line 10");
    expect(markdown).toContain("Line 20");
    expect(markdown).toContain("Line 15");
  });

  it("should include rule IDs", () => {
    const violations = createSampleViolations();
    const markdown = reporter.generateMarkdownReport(violations);

    expect(markdown).toContain("FE-NAV-001");
    expect(markdown).toContain("FE-TYPE-001");
    expect(markdown).toContain("BE-ARCH-001");
  });

  it("should include suggestions", () => {
    const violations = createSampleViolations();
    const markdown = reporter.generateMarkdownReport(violations);

    expect(markdown).toContain("Use router.push() from next/navigation");
    expect(markdown).toContain("Define proper types in types/ directory");
  });

  it("should mark auto-fixable violations", () => {
    const violations = createSampleViolations();
    const markdown = reporter.generateMarkdownReport(violations);

    expect(markdown).toContain("[auto-fix]");
  });

  it("should include code snippets", () => {
    const violations = createSampleViolations();
    const markdown = reporter.generateMarkdownReport(violations);

    expect(markdown).toContain('window.location.href = "/dashboard"');
    expect(markdown).toContain("const data: any = {}");
  });

  it("should show success message for no violations", () => {
    const markdown = reporter.generateMarkdownReport([]);

    expect(markdown).toContain("✅ No Violations Found");
    expect(markdown).toContain("Great job!");
  });

  it("should include by project breakdown", () => {
    const violations = createSampleViolations();
    const markdown = reporter.generateMarkdownReport(violations);

    expect(markdown).toContain("### By Project");
    expect(markdown).toContain("| Frontend | 3 |");
    expect(markdown).toContain("| Backend | 2 |");
  });

  it("should include by category breakdown", () => {
    const violations = createSampleViolations();
    const markdown = reporter.generateMarkdownReport(violations);

    expect(markdown).toContain("### By Category");
    expect(markdown).toContain("Navigation");
    expect(markdown).toContain("Types");
    expect(markdown).toContain("Architecture");
  });
});
