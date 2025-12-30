/**
 * Markdown Reporter
 * Generate report file với violations grouped by file/category
 */

import type {
  ReportSummary,
  RuleCategory,
  Severity,
  Violation,
} from "../types";
import type { IReporter } from "../interfaces/reporter";
import { ConsoleReporter } from "./console-reporter";

/**
 * Markdown Reporter implementation
 * Tạo báo cáo dạng markdown file
 */
export class MarkdownReporter implements IReporter {
  /**
   * Tạo báo cáo console (delegate to ConsoleReporter)
   */
  generateConsoleReport(violations: Violation[]): void {
    const consoleReporter = new ConsoleReporter();
    consoleReporter.generateConsoleReport(violations);
  }

  /**
   * Lấy emoji theo severity
   */
  private getSeverityEmoji(severity: Severity): string {
    switch (severity) {
      case "error":
        return "🔴";
      case "warning":
        return "🟡";
      case "info":
        return "🔵";
    }
  }

  /**
   * Format category name
   */
  private formatCategory(category: RuleCategory): string {
    return category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * Tạo báo cáo markdown
   */
  generateMarkdownReport(violations: Violation[]): string {
    const lines: string[] = [];
    const timestamp = new Date().toISOString();
    const summary = this.generateSummary(violations);

    // Header
    lines.push("# Code Rules Checker Report");
    lines.push("");
    lines.push(`Generated: ${timestamp}`);
    lines.push("");

    // Summary section
    lines.push("## Summary");
    lines.push("");
    lines.push(`| Metric | Count |`);
    lines.push(`|--------|-------|`);
    lines.push(`| Total Violations | ${summary.totalViolations} |`);
    lines.push(`| 🔴 Errors | ${summary.bySeverity.error} |`);
    lines.push(`| 🟡 Warnings | ${summary.bySeverity.warning} |`);
    lines.push(`| 🔵 Info | ${summary.bySeverity.info} |`);
    lines.push(`| 🔧 Auto-fixable | ${summary.autoFixable} |`);
    lines.push("");

    // By Project
    lines.push("### By Project");
    lines.push("");
    lines.push(`| Project | Count |`);
    lines.push(`|---------|-------|`);
    lines.push(`| Frontend | ${summary.byProject.frontend} |`);
    lines.push(`| Backend | ${summary.byProject.backend} |`);
    lines.push("");

    // By Category
    lines.push("### By Category");
    lines.push("");
    lines.push(`| Category | Count |`);
    lines.push(`|----------|-------|`);
    for (const [category, count] of Object.entries(summary.byCategory)) {
      lines.push(
        `| ${this.formatCategory(category as RuleCategory)} | ${count} |`,
      );
    }
    lines.push("");

    // Separate Frontend and Backend violations
    const frontendViolations = violations.filter(
      (v) => v.projectType === "frontend",
    );
    const backendViolations = violations.filter(
      (v) => v.projectType === "backend",
    );

    // Frontend Violations
    if (frontendViolations.length > 0) {
      lines.push("## Frontend Violations");
      lines.push("");
      lines.push(...this.generateViolationsSection(frontendViolations));
    }

    // Backend Violations
    if (backendViolations.length > 0) {
      lines.push("## Backend Violations");
      lines.push("");
      lines.push(...this.generateViolationsSection(backendViolations));
    }

    // No violations
    if (violations.length === 0) {
      lines.push("## ✅ No Violations Found");
      lines.push("");
      lines.push("Great job! Your code follows all the coding rules.");
    }

    return lines.join("\n");
  }

  /**
   * Generate violations section grouped by file
   */
  private generateViolationsSection(violations: Violation[]): string[] {
    const lines: string[] = [];
    const byFile = this.groupByFile(violations);

    for (const [file, fileViolations] of Object.entries(byFile)) {
      lines.push(`### 📁 ${file}`);
      lines.push("");

      // Sort by line number
      const sorted = fileViolations.sort((a, b) => a.line - b.line);

      for (const v of sorted) {
        const emoji = this.getSeverityEmoji(v.severity);
        const autoFix = v.canAutoFix ? " `[auto-fix]`" : "";

        lines.push(`#### ${emoji} Line ${v.line}: ${v.ruleId}${autoFix}`);
        lines.push("");
        lines.push(`**${v.ruleName}** - ${v.message}`);
        lines.push("");

        // Code snippet
        if (v.codeSnippet) {
          lines.push("```");
          lines.push(v.codeSnippet.trim());
          lines.push("```");
          lines.push("");
        }

        // Suggestion
        if (v.suggestion) {
          lines.push(`💡 **Suggestion:** ${v.suggestion}`);
          lines.push("");
        }

        // Fix code
        if (v.fixCode) {
          lines.push("**Suggested fix:**");
          lines.push("```");
          lines.push(v.fixCode.trim());
          lines.push("```");
          lines.push("");
        }
      }
    }

    return lines;
  }

  /**
   * Group violations by file
   */
  private groupByFile(violations: Violation[]): Record<string, Violation[]> {
    return violations.reduce(
      (acc, v) => {
        if (!acc[v.file]) acc[v.file] = [];
        acc[v.file].push(v);
        return acc;
      },
      {} as Record<string, Violation[]>,
    );
  }

  /**
   * Group violations by category
   */
  private groupByCategory(
    violations: Violation[],
  ): Record<RuleCategory, Violation[]> {
    return violations.reduce(
      (acc, v) => {
        if (!acc[v.category]) acc[v.category] = [];
        acc[v.category].push(v);
        return acc;
      },
      {} as Record<RuleCategory, Violation[]>,
    );
  }

  /**
   * Tạo summary statistics
   */
  generateSummary(violations: Violation[]): ReportSummary {
    const summary: ReportSummary = {
      totalViolations: violations.length,
      byProject: { frontend: 0, backend: 0 },
      bySeverity: { error: 0, warning: 0, info: 0 },
      byCategory: {},
      byFile: {},
      autoFixable: 0,
    };

    for (const v of violations) {
      // By project
      if (v.projectType === "frontend") summary.byProject.frontend++;
      else if (v.projectType === "backend") summary.byProject.backend++;

      // By severity
      summary.bySeverity[v.severity]++;

      // By category
      summary.byCategory[v.category] =
        (summary.byCategory[v.category] || 0) + 1;

      // By file
      summary.byFile[v.file] = (summary.byFile[v.file] || 0) + 1;

      // Auto-fixable
      if (v.canAutoFix) summary.autoFixable++;
    }

    return summary;
  }
}
