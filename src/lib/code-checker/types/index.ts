/**
 * Core types cho Code Rules Checker
 * Định nghĩa các interfaces chính: Scanner, Rule, Violation, Reporter
 */

// ============================================
// ENUMS
// ============================================

/**
 * Loại dự án được kiểm tra
 */
export type ProjectType = "frontend" | "backend" | "both";

/**
 * Mức độ nghiêm trọng của vi phạm
 */
export type Severity = "error" | "warning" | "info";

/**
 * Danh mục quy tắc
 */
export type RuleCategory =
  // Frontend categories
  | "navigation"
  | "api-calls"
  | "authentication"
  | "components"
  | "component-placement"
  | "types"
  | "tables"
  | "statistics-cards"
  | "image-upload"
  | "performance"
  | "i18n"
  | "currency"
  | "comments"
  // Backend categories
  | "architecture"
  | "exception-handling"
  | "response"
  | "transaction"
  | "repository"
  | "naming"
  | "security"
  | "entity"
  | "mapper";

/**
 * Loại file được hỗ trợ
 */
export type FileType = "typescript" | "tsx" | "jsx" | "java";

// ============================================
// FILE INFO
// ============================================

/**
 * Thông tin về file được quét
 */
export interface FileInfo {
  /** Đường dẫn tuyệt đối */
  path: string;
  /** Đường dẫn tương đối từ project root */
  relativePath: string;
  /** Loại file */
  type: FileType;
  /** Là file page.tsx */
  isPage: boolean;
  /** Là file component */
  isComponent: boolean;
  /** Là file service (Java) */
  isService: boolean;
  /** Là file controller (Java) */
  isController: boolean;
  /** Là file mapper (Java) */
  isMapper: boolean;
  /** Là file entity (Java) */
  isEntity: boolean;
  /** Là file repository (Java) */
  isRepository: boolean;
}

// ============================================
// IMPORT/EXPORT INFO
// ============================================

/**
 * Thông tin về import statement
 */
export interface ImportInfo {
  /** Module được import */
  source: string;
  /** Các named imports */
  namedImports: string[];
  /** Default import */
  defaultImport?: string;
  /** Namespace import (import * as X) */
  namespaceImport?: string;
  /** Dòng chứa import */
  line: number;
}

/**
 * Thông tin về export statement
 */
export interface ExportInfo {
  /** Tên được export */
  name: string;
  /** Là default export */
  isDefault: boolean;
  /** Dòng chứa export */
  line: number;
}

/**
 * Thông tin về comment
 */
export interface CommentInfo {
  /** Nội dung comment */
  content: string;
  /** Dòng bắt đầu */
  line: number;
  /** Dòng kết thúc */
  endLine: number;
  /** Là block comment */
  isBlock: boolean;
}

// ============================================
// PARSED FILE
// ============================================

/**
 * File đã được parse
 */
export interface ParsedFile {
  /** Thông tin file */
  file: FileInfo;
  /** Nội dung các dòng */
  lines: string[];
  /** Số dòng */
  lineCount: number;
  /** Danh sách imports */
  imports: ImportInfo[];
  /** Danh sách exports */
  exports: ExportInfo[];
  /** Danh sách comments */
  comments: CommentInfo[];
  /** Có directive 'use client' */
  hasUseClient: boolean;
  /** Có directive 'use server' */
  hasUseServer: boolean;
  /** Raw content */
  content: string;
}

// ============================================
// JAVA SPECIFIC
// ============================================

/**
 * Thông tin annotation Java
 */
export interface JavaAnnotation {
  /** Tên annotation */
  name: string;
  /** Các tham số */
  parameters: Record<string, string>;
  /** Dòng chứa annotation */
  line: number;
}

/**
 * Thông tin method Java
 */
export interface JavaMethod {
  /** Tên method */
  name: string;
  /** Return type */
  returnType: string;
  /** Các annotations */
  annotations: JavaAnnotation[];
  /** Dòng bắt đầu */
  line: number;
  /** Dòng kết thúc */
  endLine: number;
  /** Access modifier */
  modifier: "public" | "private" | "protected" | "default";
}

/**
 * Thông tin field Java
 */
export interface JavaField {
  /** Tên field */
  name: string;
  /** Type */
  type: string;
  /** Các annotations */
  annotations: JavaAnnotation[];
  /** Dòng */
  line: number;
}

/**
 * File Java đã được parse
 */
export interface ParsedJavaFile extends ParsedFile {
  /** Tên class */
  className: string;
  /** Package name */
  packageName: string;
  /** Các annotations của class */
  classAnnotations: JavaAnnotation[];
  /** Các methods */
  methods: JavaMethod[];
  /** Các fields */
  fields: JavaField[];
  /** Extends class */
  extendsClass?: string;
  /** Implements interfaces */
  implementsInterfaces: string[];
}

// ============================================
// VIOLATION
// ============================================

/**
 * Vi phạm được phát hiện
 */
export interface Violation {
  /** ID duy nhất */
  id: string;
  /** ID của rule */
  ruleId: string;
  /** Tên rule */
  ruleName: string;
  /** Danh mục */
  category: RuleCategory;
  /** Mức độ nghiêm trọng */
  severity: Severity;
  /** Loại dự án */
  projectType: ProjectType;
  /** Đường dẫn file */
  file: string;
  /** Dòng vi phạm */
  line: number;
  /** Cột vi phạm */
  column: number;
  /** Dòng kết thúc (nếu multi-line) */
  endLine?: number;
  /** Cột kết thúc */
  endColumn?: number;
  /** Mô tả vi phạm */
  message: string;
  /** Gợi ý sửa */
  suggestion: string;
  /** Code snippet vi phạm */
  codeSnippet: string;
  /** Có thể auto-fix */
  canAutoFix: boolean;
  /** Code sau khi fix */
  fixCode?: string;
}

// ============================================
// RULE CONTEXT
// ============================================

/**
 * Import graph để phân tích component placement
 */
export interface ImportGraph {
  /** Map từ file path đến danh sách files import nó */
  importedBy: Map<string, string[]>;
  /** Map từ file path đến danh sách files nó import */
  imports: Map<string, string[]>;
}

/**
 * Context cho rule execution
 */
export interface RuleContext {
  /** Đường dẫn root của project */
  projectRoot: string;
  /** Tất cả files được quét */
  allFiles: FileInfo[];
  /** Import graph */
  importGraph: ImportGraph;
}

// ============================================
// FIX RESULT
// ============================================

/**
 * Thay đổi dòng
 */
export interface LineChange {
  /** Dòng */
  line: number;
  /** Nội dung cũ */
  oldContent: string;
  /** Nội dung mới */
  newContent: string;
}

/**
 * Preview diff
 */
export interface DiffPreview {
  /** Đường dẫn file */
  file: string;
  /** Nội dung trước */
  before: string;
  /** Nội dung sau */
  after: string;
  /** Các thay đổi dòng */
  lineChanges: LineChange[];
}

/**
 * Kết quả fix
 */
export interface FixResult {
  /** Thành công */
  success: boolean;
  /** Đường dẫn file */
  file: string;
  /** Vi phạm được fix */
  violation: Violation;
  /** Lỗi nếu có */
  error?: string;
}

// ============================================
// REPORT SUMMARY
// ============================================

/**
 * Tóm tắt báo cáo
 */
export interface ReportSummary {
  /** Tổng số vi phạm */
  totalViolations: number;
  /** Theo project */
  byProject: {
    frontend: number;
    backend: number;
  };
  /** Theo severity */
  bySeverity: {
    error: number;
    warning: number;
    info: number;
  };
  /** Theo category */
  byCategory: Partial<Record<RuleCategory, number>>;
  /** Theo file */
  byFile: Record<string, number>;
  /** Số có thể auto-fix */
  autoFixable: number;
}

// ============================================
// SCAN OPTIONS
// ============================================

/**
 * Tùy chọn quét
 */
export interface ScanOptions {
  /** Glob patterns để include */
  include: string[];
  /** Glob patterns để exclude */
  exclude: string[];
  /** Loại project */
  projectType: ProjectType;
}
