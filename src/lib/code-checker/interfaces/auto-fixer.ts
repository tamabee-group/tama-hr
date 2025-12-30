/**
 * Auto-Fixer Interface
 * Tự động sửa vi phạm
 */

import type { DiffPreview, FixResult, Violation } from "../types";

/**
 * Interface cho AutoFixer component
 */
export interface IAutoFixer {
  /**
   * Xem trước thay đổi
   * @param violation Vi phạm cần fix
   * @returns Preview diff
   */
  previewFix(violation: Violation): Promise<DiffPreview>;

  /**
   * Áp dụng fix cho một vi phạm
   * @param violation Vi phạm cần fix
   * @returns Kết quả fix
   */
  applyFix(violation: Violation): Promise<FixResult>;

  /**
   * Áp dụng tất cả fixes có thể
   * @param violations Danh sách vi phạm
   * @returns Danh sách kết quả fix
   */
  applyAllFixes(violations: Violation[]): Promise<FixResult[]>;
}
