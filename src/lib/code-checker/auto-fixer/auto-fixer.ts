/**
 * Auto-Fixer
 * Main class để tự động sửa vi phạm
 */

import type { DiffPreview, FixResult, Violation } from "../types";
import type { IAutoFixer } from "../interfaces/auto-fixer";
import { DiffGenerator } from "./diff-generator";
import { FixApplier } from "./fix-applier";

/**
 * Auto-Fixer implementation
 * Tự động sửa các vi phạm có thể fix được
 */
export class AutoFixer implements IAutoFixer {
  private diffGenerator: DiffGenerator;
  private fixApplier: FixApplier;

  constructor() {
    this.diffGenerator = new DiffGenerator();
    this.fixApplier = new FixApplier();
  }

  /**
   * Xem trước thay đổi
   */
  async previewFix(violation: Violation): Promise<DiffPreview> {
    return this.fixApplier.previewFix(violation);
  }

  /**
   * Áp dụng fix cho một vi phạm
   */
  async applyFix(violation: Violation): Promise<FixResult> {
    return this.fixApplier.applyFix(violation);
  }

  /**
   * Áp dụng tất cả fixes có thể
   */
  async applyAllFixes(violations: Violation[]): Promise<FixResult[]> {
    // Lọc chỉ những violations có thể auto-fix
    const fixableViolations = violations.filter(
      (v) => v.canAutoFix && v.fixCode,
    );

    if (fixableViolations.length === 0) {
      return [];
    }

    return this.fixApplier.applyMultipleFixes(fixableViolations);
  }

  /**
   * Preview tất cả fixes
   */
  async previewAllFixes(violations: Violation[]): Promise<DiffPreview[]> {
    return this.fixApplier.previewMultipleFixes(violations);
  }

  /**
   * Format diff cho console output
   */
  formatDiffForConsole(diff: DiffPreview, useColors = true): string {
    return this.diffGenerator.formatDiffForConsole(diff, useColors);
  }

  /**
   * Format diff cho markdown output
   */
  formatDiffForMarkdown(diff: DiffPreview): string {
    return this.diffGenerator.formatDiffForMarkdown(diff);
  }

  /**
   * Lấy số lượng violations có thể auto-fix
   */
  getFixableCount(violations: Violation[]): number {
    return violations.filter((v) => v.canAutoFix && v.fixCode).length;
  }

  /**
   * Lọc violations có thể auto-fix
   */
  getFixableViolations(violations: Violation[]): Violation[] {
    return violations.filter((v) => v.canAutoFix && v.fixCode);
  }

  /**
   * Print fix results summary
   */
  printFixResults(results: FixResult[], useColors = true): void {
    const green = useColors ? "\x1b[32m" : "";
    const red = useColors ? "\x1b[31m" : "";
    const reset = useColors ? "\x1b[0m" : "";
    const bold = useColors ? "\x1b[1m" : "";

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    console.log(`\n${bold}Auto-Fix Results${reset}\n`);
    console.log(`${green}✓ Fixed: ${successful.length}${reset}`);
    console.log(`${red}✗ Failed: ${failed.length}${reset}`);

    if (successful.length > 0) {
      console.log(`\n${bold}Fixed violations:${reset}`);
      for (const result of successful) {
        console.log(
          `  ${green}✓${reset} ${result.file}:${result.violation.line} [${result.violation.ruleId}]`,
        );
      }
    }

    if (failed.length > 0) {
      console.log(`\n${bold}Failed fixes:${reset}`);
      for (const result of failed) {
        console.log(
          `  ${red}✗${reset} ${result.file}:${result.violation.line} [${result.violation.ruleId}]`,
        );
        if (result.error) {
          console.log(`    Error: ${result.error}`);
        }
      }
    }
  }
}
