/**
 * Fix Applier
 * Apply fixes preserving formatting, handle errors gracefully
 */

import * as fs from "fs/promises";
import * as path from "path";
import type { DiffPreview, FixResult, Violation } from "../types";
import { DiffGenerator } from "./diff-generator";

/**
 * Fix Applier
 * Áp dụng fixes vào files
 */
export class FixApplier {
  private diffGenerator: DiffGenerator;

  constructor() {
    this.diffGenerator = new DiffGenerator();
  }

  /**
   * Áp dụng fix cho một violation
   */
  async applyFix(violation: Violation): Promise<FixResult> {
    // Kiểm tra có thể auto-fix không
    if (!violation.canAutoFix || !violation.fixCode) {
      return {
        success: false,
        file: violation.file,
        violation,
        error: "Violation cannot be auto-fixed",
      };
    }

    try {
      // Đọc file hiện tại
      const content = await fs.readFile(violation.file, "utf-8");
      const lines = content.split("\n");

      // Kiểm tra line number hợp lệ
      const lineIndex = violation.line - 1;
      if (lineIndex < 0 || lineIndex >= lines.length) {
        return {
          success: false,
          file: violation.file,
          violation,
          error: `Invalid line number: ${violation.line}`,
        };
      }

      // Áp dụng fix
      const newContent = this.applyFixToContent(content, violation);

      // Ghi file
      await fs.writeFile(violation.file, newContent, "utf-8");

      return {
        success: true,
        file: violation.file,
        violation,
      };
    } catch (error) {
      return {
        success: false,
        file: violation.file,
        violation,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Áp dụng fix vào content
   */
  private applyFixToContent(content: string, violation: Violation): string {
    const lines = content.split("\n");
    const lineIndex = violation.line - 1;

    if (!violation.fixCode) return content;

    // Xử lý multi-line fix
    if (violation.endLine && violation.endLine > violation.line) {
      // Xóa các dòng từ line đến endLine và thay bằng fixCode
      const fixLines = violation.fixCode.split("\n");
      lines.splice(
        lineIndex,
        violation.endLine - violation.line + 1,
        ...fixLines,
      );
    } else {
      // Single line fix
      const oldLine = lines[lineIndex];
      lines[lineIndex] = this.applyLinefix(oldLine, violation);
    }

    return lines.join("\n");
  }

  /**
   * Áp dụng fix cho một dòng
   */
  private applyLinefix(line: string, violation: Violation): string {
    if (!violation.fixCode) return line;

    // Preserve indentation
    const indentMatch = line.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1] : "";

    // Nếu codeSnippet có trong line, thay thế nó
    const snippet = violation.codeSnippet.trim();
    if (snippet && line.includes(snippet)) {
      return line.replace(snippet, violation.fixCode.trim());
    }

    // Nếu fixCode đã có indentation, dùng trực tiếp
    if (
      violation.fixCode.startsWith(" ") ||
      violation.fixCode.startsWith("\t")
    ) {
      return violation.fixCode;
    }

    // Thêm indentation vào fixCode
    return indent + violation.fixCode.trim();
  }

  /**
   * Áp dụng nhiều fixes
   * Sắp xếp theo line number giảm dần để tránh offset issues
   */
  async applyMultipleFixes(violations: Violation[]): Promise<FixResult[]> {
    const results: FixResult[] = [];

    // Group by file
    const byFile = this.groupByFile(violations);

    for (const [file, fileViolations] of Object.entries(byFile)) {
      // Sort by line number descending (fix từ cuối file lên)
      const sorted = fileViolations
        .filter((v) => v.canAutoFix && v.fixCode)
        .sort((a, b) => b.line - a.line);

      for (const violation of sorted) {
        const result = await this.applyFix(violation);
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Preview fix trước khi áp dụng
   */
  async previewFix(violation: Violation): Promise<DiffPreview> {
    if (!violation.canAutoFix || !violation.fixCode) {
      return {
        file: violation.file,
        before: "",
        after: "",
        lineChanges: [],
      };
    }

    try {
      const content = await fs.readFile(violation.file, "utf-8");
      return this.diffGenerator.generateDiff(content, violation);
    } catch (error) {
      return {
        file: violation.file,
        before: "",
        after: "",
        lineChanges: [],
      };
    }
  }

  /**
   * Preview nhiều fixes
   */
  async previewMultipleFixes(violations: Violation[]): Promise<DiffPreview[]> {
    const previews: DiffPreview[] = [];

    for (const violation of violations) {
      if (violation.canAutoFix && violation.fixCode) {
        const preview = await this.previewFix(violation);
        if (preview.lineChanges.length > 0) {
          previews.push(preview);
        }
      }
    }

    return previews;
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
   * Backup file trước khi fix
   */
  async backupFile(filePath: string): Promise<string> {
    const backupPath = `${filePath}.backup`;
    const content = await fs.readFile(filePath, "utf-8");
    await fs.writeFile(backupPath, content, "utf-8");
    return backupPath;
  }

  /**
   * Restore file từ backup
   */
  async restoreFromBackup(filePath: string): Promise<void> {
    const backupPath = `${filePath}.backup`;
    const content = await fs.readFile(backupPath, "utf-8");
    await fs.writeFile(filePath, content, "utf-8");
    await fs.unlink(backupPath);
  }
}
