/**
 * Console Reporter
 * Format violations với màu sắc theo severity
 */

import type { ReportSummary, Severity, Violation } from "../types";
import type { IReporter } from "../interfaces/reporter";
import { MarkdownReporter } from "./markdown-reporter";

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",

  // Severity colors
  error: "\x1b[31m", // Red
  warning: "\x1b[33m", // Yellow
  info: "\x1b[36m", // Cyan

  // Other colors
  green: "\x1b[32m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
};

// ASCII-safe icons (Windows CMD compatible)
const asciiIcons = {
  error: "[X]",
  warning: "[!]",
  info: "[i]",
  success: "[OK]",
  suggestion: "->",
  autofix: "[fix]",
  separator: "-",
};

/**
 * Console Reporter implementation
 * Hiển thị violations ra console với màu sắc
 */
export class ConsoleReporter implements IReporter {
  private useColors: boolean;

  constructor(useColors = true) {
    this.useColors = useColors;
  }

  /**
   * Lấy màu theo severity
   */
  private getSeverityColor(severity: Severity): string {
    if (!this.useColors) return "";
    return colors[severity];
  }

  /**
   * Lấy icon theo severity (ASCII-safe cho Windows)
   */
  private getSeverityIcon(severity: Severity): string {
    return asciiIcons[severity];
  }

  /**
   * Format một violation
   */
  private formatViolation(violation: Violation): string {
    const color = this.getSeverityColor(violation.severity);
    const reset = this.useColors ? colors.reset : "";
    const dim = this.useColors ? colors.dim : "";
    const icon = this.getSeverityIcon(violation.severity);

    const lines: string[] = [];

    // File location
    lines.push(
      `${dim}${violation.file}:${violation.line}:${violation.column}${reset}`,
    );

    // Severity + Rule ID + Message
    lines.push(
      `  ${color}${icon} ${violation.severity.toUpperCase()}${reset} ${dim}[${violation.ruleId}]${reset} ${violation.message}`,
    );

    // Code snippet
    if (violation.codeSnippet) {
      const snippet = violation.codeSnippet.trim().substring(0, 80);
      lines.push(
        `  ${dim}> ${snippet}${snippet.length >= 80 ? "..." : ""}${reset}`,
      );
    }

    // Suggestion
    if (violation.suggestion) {
      lines.push(
        `  ${this.useColors ? colors.green : ""}${asciiIcons.suggestion} ${violation.suggestion}${reset}`,
      );
    }

    // Auto-fix available
    if (violation.canAutoFix) {
      lines.push(
        `  ${this.useColors ? colors.blue : ""}${asciiIcons.autofix} [auto-fix available]${reset}`,
      );
    }

    return lines.join("\n");
  }

  /**
   * Tạo báo cáo console
   */
  generateConsoleReport(violations: Violation[]): void {
    if (violations.length === 0) {
      console.log(
        `${this.useColors ? colors.green : ""}${asciiIcons.success} No violations found!${this.useColors ? colors.reset : ""}`,
      );
      return;
    }

    const reset = this.useColors ? colors.reset : "";
    const bold = this.useColors ? colors.bold : "";
    const dim = this.useColors ? colors.dim : "";

    // Header
    console.log(`\n${bold}Code Rules Checker Report${reset}\n`);
    console.log(`${dim}${asciiIcons.separator.repeat(60)}${reset}\n`);

    // Group by file
    const byFile = this.groupByFile(violations);

    for (const [file, fileViolations] of Object.entries(byFile)) {
      console.log(
        `${bold}${file}${reset} (${fileViolations.length} violations)\n`,
      );

      for (const violation of fileViolations) {
        console.log(this.formatViolation(violation));
        console.log("");
      }
    }

    // Summary
    const summary = this.generateSummary(violations);
    this.printSummary(summary);
  }

  /**
   * In summary
   */
  private printSummary(summary: ReportSummary): void {
    const reset = this.useColors ? colors.reset : "";
    const bold = this.useColors ? colors.bold : "";
    const dim = this.useColors ? colors.dim : "";
    const red = this.useColors ? colors.error : "";
    const yellow = this.useColors ? colors.warning : "";
    const cyan = this.useColors ? colors.info : "";
    const green = this.useColors ? colors.green : "";

    console.log(`\n${dim}${asciiIcons.separator.repeat(60)}${reset}`);
    console.log(`${bold}Summary${reset}`);
    console.log("");
    console.log(`Total: ${bold}${summary.totalViolations}${reset} violations`);
    console.log(
      `  ${red}${asciiIcons.error} Errors: ${summary.bySeverity.error}${reset}`,
    );
    console.log(
      `  ${yellow}${asciiIcons.warning} Warnings: ${summary.bySeverity.warning}${reset}`,
    );
    console.log(
      `  ${cyan}${asciiIcons.info} Info: ${summary.bySeverity.info}${reset}`,
    );
    console.log("");

    console.log(`By Project:`);
    console.log(`  Frontend: ${summary.byProject.frontend}`);
    console.log(`  Backend: ${summary.byProject.backend}`);
    console.log("");

    if (summary.autoFixable > 0) {
      console.log(
        `${green}${asciiIcons.autofix} Auto-fixable: ${summary.autoFixable}${reset}`,
      );
      console.log(`${dim}Run with --fix to auto-fix violations${reset}`);
    }
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
   * Tạo báo cáo markdown
   */
  generateMarkdownReport(violations: Violation[]): string {
    // Delegate to MarkdownReporter
    const mdReporter = new MarkdownReporter();
    return mdReporter.generateMarkdownReport(violations);
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
