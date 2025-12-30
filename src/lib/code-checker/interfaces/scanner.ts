/**
 * Scanner Interface
 * Chịu trách nhiệm quét và phân tích cấu trúc file
 */

import type {
  FileInfo,
  ParsedFile,
  ParsedJavaFile,
  ScanOptions,
} from "../types";

/**
 * Interface cho Scanner component
 */
export interface IScanner {
  /**
   * Quét thư mục và trả về danh sách files cần kiểm tra
   * @param path Đường dẫn thư mục
   * @param options Tùy chọn quét
   * @returns Danh sách FileInfo
   */
  scanDirectory(path: string, options: ScanOptions): Promise<FileInfo[]>;

  /**
   * Parse file TypeScript/TSX thành ParsedFile
   * @param file Thông tin file
   * @returns ParsedFile
   */
  parseTypeScriptFile(file: FileInfo): Promise<ParsedFile>;

  /**
   * Parse file Java thành ParsedJavaFile
   * @param file Thông tin file
   * @returns ParsedJavaFile
   */
  parseJavaFile(file: FileInfo): Promise<ParsedJavaFile>;
}
