/**
 * TypeScript/TSX Parser
 * Parse file TypeScript thành AST và trích xuất thông tin
 */

import * as fs from "fs";
import type {
  CommentInfo,
  ExportInfo,
  FileInfo,
  ImportInfo,
  ParsedFile,
} from "../types";

/**
 * Parse import statements từ content
 */
function parseImports(lines: string[]): ImportInfo[] {
  const imports: ImportInfo[] = [];
  const importRegex =
    /^import\s+(?:(?:(\w+)\s*,?\s*)?(?:\{\s*([^}]+)\s*\})?(?:\*\s+as\s+(\w+))?)\s*from\s*['"]([^'"]+)['"]/;
  const simpleImportRegex = /^import\s+['"]([^'"]+)['"]/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Simple import (import 'module')
    const simpleMatch = line.match(simpleImportRegex);
    if (simpleMatch) {
      imports.push({
        source: simpleMatch[1],
        namedImports: [],
        line: i + 1,
      });
      continue;
    }

    // Full import
    const match = line.match(importRegex);
    if (match) {
      const [, defaultImport, namedImportsStr, namespaceImport, source] = match;
      const namedImports = namedImportsStr
        ? namedImportsStr
            .split(",")
            .map((s) => s.trim().split(" as ")[0].trim())
        : [];

      imports.push({
        source,
        namedImports,
        defaultImport: defaultImport || undefined,
        namespaceImport: namespaceImport || undefined,
        line: i + 1,
      });
    }
  }

  return imports;
}

/**
 * Parse export statements từ content
 */
function parseExports(lines: string[]): ExportInfo[] {
  const exports: ExportInfo[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // export default
    if (line.startsWith("export default")) {
      const match = line.match(/export\s+default\s+(?:function\s+)?(\w+)?/);
      exports.push({
        name: match?.[1] || "default",
        isDefault: true,
        line: i + 1,
      });
      continue;
    }

    // export const/function/class
    const namedMatch = line.match(
      /^export\s+(?:const|let|var|function|class|interface|type|enum)\s+(\w+)/,
    );
    if (namedMatch) {
      exports.push({
        name: namedMatch[1],
        isDefault: false,
        line: i + 1,
      });
    }
  }

  return exports;
}

/**
 * Parse comments từ content
 */
function parseComments(content: string, lines: string[]): CommentInfo[] {
  const comments: CommentInfo[] = [];

  // Single line comments
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const singleLineMatch = line.match(/\/\/(.*)$/);
    if (singleLineMatch) {
      comments.push({
        content: singleLineMatch[1].trim(),
        line: i + 1,
        endLine: i + 1,
        isBlock: false,
      });
    }
  }

  // Block comments
  const blockCommentRegex = /\/\*[\s\S]*?\*\//g;
  let match;
  while ((match = blockCommentRegex.exec(content)) !== null) {
    const startIndex = match.index;
    const endIndex = startIndex + match[0].length;

    // Tính line number
    const beforeStart = content.substring(0, startIndex);
    const startLine = (beforeStart.match(/\n/g) || []).length + 1;

    const beforeEnd = content.substring(0, endIndex);
    const endLine = (beforeEnd.match(/\n/g) || []).length + 1;

    comments.push({
      content: match[0].replace(/^\/\*\s*|\s*\*\/$/g, "").trim(),
      line: startLine,
      endLine,
      isBlock: true,
    });
  }

  return comments;
}

/**
 * Kiểm tra file có 'use client' directive
 */
function hasUseClientDirective(lines: string[]): boolean {
  for (const line of lines.slice(0, 10)) {
    // Chỉ check 10 dòng đầu
    const trimmed = line.trim();
    if (trimmed === "'use client'" || trimmed === '"use client"') {
      return true;
    }
    // Bỏ qua comments và empty lines
    if (trimmed && !trimmed.startsWith("//") && !trimmed.startsWith("/*")) {
      break;
    }
  }
  return false;
}

/**
 * Kiểm tra file có 'use server' directive
 */
function hasUseServerDirective(lines: string[]): boolean {
  for (const line of lines.slice(0, 10)) {
    const trimmed = line.trim();
    if (trimmed === "'use server'" || trimmed === '"use server"') {
      return true;
    }
    if (trimmed && !trimmed.startsWith("//") && !trimmed.startsWith("/*")) {
      break;
    }
  }
  return false;
}

/**
 * Parse file TypeScript/TSX
 */
export async function parseTypeScriptFile(file: FileInfo): Promise<ParsedFile> {
  const content = fs.readFileSync(file.path, "utf-8");
  const lines = content.split("\n");

  return {
    file,
    lines,
    lineCount: lines.length,
    imports: parseImports(lines),
    exports: parseExports(lines),
    comments: parseComments(content, lines),
    hasUseClient: hasUseClientDirective(lines),
    hasUseServer: hasUseServerDirective(lines),
    content,
  };
}
