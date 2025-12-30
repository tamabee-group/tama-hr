/**
 * Diff Generator
 * Generate before/after diff, show line changes
 */

import type { DiffPreview, LineChange, Violation } from "../types";

/**
 * Diff Generator
 * Tạo preview diff cho violations
 */
export class DiffGenerator {
  /**
   * Generate diff preview cho một violation
   */
  generateDiff(originalContent: string, violation: Violation): DiffPreview {
    const lines = originalContent.split("\n");
    const lineChanges: LineChange[] = [];

    if (!violation.fixCode) {
      return {
        file: violation.file,
        before: originalContent,
        after: originalContent,
        lineChanges: [],
      };
    }

    // Tìm dòng cần thay đổi
    const lineIndex = violation.line - 1;
    if (lineIndex < 0 || lineIndex >= lines.length) {
      return {
        file: violation.file,
        before: originalContent,
        after: originalContent,
        lineChanges: [],
      };
    }

    const oldLine = lines[lineIndex];
    const newLine = this.applyFix(oldLine, violation);

    // Tạo line change
    lineChanges.push({
      line: violation.line,
      oldContent: oldLine,
      newContent: newLine,
    });

    // Tạo nội dung mới
    const newLines = [...lines];
    newLines[lineIndex] = newLine;
    const newContent = newLines.join("\n");

    return {
      file: violation.file,
      before: originalContent,
      after: newContent,
      lineChanges,
    };
  }

  /**
   * Apply fix to a line
   */
  private applyFix(line: string, violation: Violation): string {
    if (!violation.fixCode) return line;

    // Nếu fixCode là replacement hoàn chỉnh cho dòng
    if (violation.fixCode.includes("\n") || !violation.codeSnippet) {
      return violation.fixCode;
    }

    // Thay thế code snippet bằng fix code
    const snippet = violation.codeSnippet.trim();
    if (line.includes(snippet)) {
      return line.replace(snippet, violation.fixCode.trim());
    }

    // Fallback: trả về fixCode
    return violation.fixCode;
  }

  /**
   * Format diff output cho console
   */
  formatDiffForConsole(diff: DiffPreview, useColors = true): string {
    const lines: string[] = [];
    const red = useColors ? "\x1b[31m" : "";
    const green = useColors ? "\x1b[32m" : "";
    const reset = useColors ? "\x1b[0m" : "";
    const dim = useColors ? "\x1b[2m" : "";

    lines.push(`${dim}--- ${diff.file}${reset}`);
    lines.push(`${dim}+++ ${diff.file}${reset}`);
    lines.push("");

    for (const change of diff.lineChanges) {
      lines.push(`${dim}@@ Line ${change.line} @@${reset}`);
      lines.push(`${red}- ${change.oldContent}${reset}`);
      lines.push(`${green}+ ${change.newContent}${reset}`);
      lines.push("");
    }

    return lines.join("\n");
  }

  /**
   * Format diff output cho markdown
   */
  formatDiffForMarkdown(diff: DiffPreview): string {
    const lines: string[] = [];

    lines.push(`**File:** \`${diff.file}\``);
    lines.push("");
    lines.push("```diff");

    for (const change of diff.lineChanges) {
      lines.push(`@@ Line ${change.line} @@`);
      lines.push(`- ${change.oldContent}`);
      lines.push(`+ ${change.newContent}`);
    }

    lines.push("```");

    return lines.join("\n");
  }

  /**
   * Generate unified diff format
   */
  generateUnifiedDiff(diff: DiffPreview, contextLines = 3): string {
    const beforeLines = diff.before.split("\n");
    const afterLines = diff.after.split("\n");
    const output: string[] = [];

    output.push(`--- a/${diff.file}`);
    output.push(`+++ b/${diff.file}`);

    for (const change of diff.lineChanges) {
      const lineNum = change.line;
      const startLine = Math.max(1, lineNum - contextLines);
      const endLine = Math.min(beforeLines.length, lineNum + contextLines);

      output.push(
        `@@ -${startLine},${endLine - startLine + 1} +${startLine},${endLine - startLine + 1} @@`,
      );

      for (let i = startLine - 1; i < endLine; i++) {
        if (i === lineNum - 1) {
          output.push(`-${beforeLines[i]}`);
          output.push(`+${afterLines[i]}`);
        } else {
          output.push(` ${beforeLines[i]}`);
        }
      }
    }

    return output.join("\n");
  }
}
