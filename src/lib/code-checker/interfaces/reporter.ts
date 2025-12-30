/**
 * Reporter Interface
 * Tạo báo cáo vi phạm
 */

import type { ReportSummary, Violation } from "../types";

/**
 * Interface cho Reporter component
 */
export interface IReporter {
  /**
   * Tạo báo cáo console (có màu)
   * @param violations Danh sách vi phạm
   */
  generateConsoleReport(violations: Violation[]): void;

  /**
   * Tạo báo cáo markdown
   * @param violations Danh sách vi phạm
   * @returns Nội dung markdown
   */
  generateMarkdownReport(violations: Violation[]): string;

  /**
   * Tạo summary statistics
   * @param violations Danh sách vi phạm
   * @returns ReportSummary
   */
  generateSummary(violations: Violation[]): ReportSummary;
}
