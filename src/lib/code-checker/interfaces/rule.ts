/**
 * Rule Interface
 * Định nghĩa cấu trúc của một rule kiểm tra
 */

import type {
  ParsedFile,
  ParsedJavaFile,
  ProjectType,
  RuleCategory,
  RuleContext,
  Severity,
  Violation,
  FixResult,
} from "../types";

/**
 * Interface cho Rule
 */
export interface IRule {
  /** ID duy nhất của rule (e.g., "FE-NAV-001") */
  id: string;

  /** Tên rule */
  name: string;

  /** Danh mục */
  category: RuleCategory;

  /** Mức độ nghiêm trọng */
  severity: Severity;

  /** Mô tả rule */
  description: string;

  /** Loại project áp dụng */
  projectType: ProjectType;

  /** Có thể auto-fix */
  canAutoFix: boolean;

  /**
   * Kiểm tra file có vi phạm rule không
   * @param file File đã parse
   * @param context Context chứa thông tin project
   * @returns Danh sách vi phạm
   */
  check(file: ParsedFile | ParsedJavaFile, context: RuleContext): Violation[];

  /**
   * Thực hiện auto-fix (nếu có)
   * @param file File đã parse
   * @param violation Vi phạm cần fix
   * @returns Kết quả fix
   */
  fix?(file: ParsedFile | ParsedJavaFile, violation: Violation): FixResult;
}

/**
 * Base class cho tất cả rules
 */
export abstract class BaseRule implements IRule {
  abstract id: string;
  abstract name: string;
  abstract category: RuleCategory;
  abstract severity: Severity;
  abstract description: string;
  abstract projectType: ProjectType;
  abstract canAutoFix: boolean;

  abstract check(
    file: ParsedFile | ParsedJavaFile,
    context: RuleContext,
  ): Violation[];

  /**
   * Tạo violation object
   */
  protected createViolation(params: {
    file: string;
    line: number;
    column?: number;
    endLine?: number;
    endColumn?: number;
    message: string;
    suggestion: string;
    codeSnippet: string;
    fixCode?: string;
  }): Violation {
    return {
      id: `${this.id}-${params.file}-${params.line}`,
      ruleId: this.id,
      ruleName: this.name,
      category: this.category,
      severity: this.severity,
      projectType: this.projectType,
      file: params.file,
      line: params.line,
      column: params.column ?? 1,
      endLine: params.endLine,
      endColumn: params.endColumn,
      message: params.message,
      suggestion: params.suggestion,
      codeSnippet: params.codeSnippet,
      canAutoFix: this.canAutoFix,
      fixCode: params.fixCode,
    };
  }
}
