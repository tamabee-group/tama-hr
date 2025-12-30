/**
 * Scanner Module
 * Export tất cả scanner functions
 */

import type { IScanner } from "../interfaces/scanner";
import type {
  FileInfo,
  ParsedFile,
  ParsedJavaFile,
  ScanOptions,
  ImportGraph,
} from "../types";
import {
  discoverFiles,
  defaultFrontendOptions,
  defaultBackendOptions,
} from "./file-discovery";
import { parseTypeScriptFile } from "./typescript-parser";
import { parseJavaFile } from "./java-parser";

/**
 * Scanner implementation
 */
export class Scanner implements IScanner {
  async scanDirectory(path: string, options: ScanOptions): Promise<FileInfo[]> {
    return discoverFiles(path, options);
  }

  async parseTypeScriptFile(file: FileInfo): Promise<ParsedFile> {
    return parseTypeScriptFile(file);
  }

  async parseJavaFile(file: FileInfo): Promise<ParsedJavaFile> {
    return parseJavaFile(file);
  }
}

/**
 * Build import graph từ danh sách parsed files
 */
export function buildImportGraph(parsedFiles: ParsedFile[]): ImportGraph {
  const importedBy = new Map<string, string[]>();
  const imports = new Map<string, string[]>();

  for (const file of parsedFiles) {
    const filePath = file.file.relativePath;
    const fileImports: string[] = [];

    for (const imp of file.imports) {
      // Chỉ xử lý relative imports
      if (imp.source.startsWith(".") || imp.source.startsWith("@/")) {
        fileImports.push(imp.source);

        // Thêm vào importedBy
        const existing = importedBy.get(imp.source) || [];
        existing.push(filePath);
        importedBy.set(imp.source, existing);
      }
    }

    imports.set(filePath, fileImports);
  }

  return { importedBy, imports };
}

// Export utilities
export {
  discoverFiles,
  defaultFrontendOptions,
  defaultBackendOptions,
  parseTypeScriptFile,
  parseJavaFile,
};
