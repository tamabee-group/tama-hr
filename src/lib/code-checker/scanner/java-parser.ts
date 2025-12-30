/**
 * Java Parser
 * Parse file Java và trích xuất annotations, methods, fields
 */

import * as fs from "fs";
import type {
  CommentInfo,
  FileInfo,
  JavaAnnotation,
  JavaField,
  JavaMethod,
  ParsedJavaFile,
} from "../types";

/**
 * Parse annotations từ một đoạn code
 */
function parseAnnotations(
  lines: string[],
  startLine: number,
): JavaAnnotation[] {
  const annotations: JavaAnnotation[] = [];
  const annotationRegex = /@(\w+)(?:\(([^)]*)\))?/g;

  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i].trim();

    // Dừng khi gặp declaration (không phải annotation)
    if (
      line.startsWith("public ") ||
      line.startsWith("private ") ||
      line.startsWith("protected ") ||
      (line.match(/^\w/) && !line.startsWith("@"))
    ) {
      break;
    }

    let match;
    while ((match = annotationRegex.exec(line)) !== null) {
      const [, name, paramsStr] = match;
      const parameters: Record<string, string> = {};

      if (paramsStr) {
        // Parse parameters
        const paramPairs = paramsStr.split(",");
        for (const pair of paramPairs) {
          const [key, value] = pair.split("=").map((s) => s.trim());
          if (value) {
            parameters[key] = value.replace(/^["']|["']$/g, "");
          } else {
            parameters["value"] = key.replace(/^["']|["']$/g, "");
          }
        }
      }

      annotations.push({
        name,
        parameters,
        line: i + 1,
      });
    }
  }

  return annotations;
}

/**
 * Parse package name
 */
function parsePackageName(lines: string[]): string {
  for (const line of lines) {
    const match = line.match(/^package\s+([\w.]+)\s*;/);
    if (match) {
      return match[1];
    }
  }
  return "";
}

/**
 * Parse class declaration
 */
function parseClassDeclaration(lines: string[]): {
  className: string;
  extendsClass?: string;
  implementsInterfaces: string[];
  classLine: number;
} {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const classMatch = line.match(
      /(?:public\s+)?(?:abstract\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([\w,\s]+))?/,
    );

    if (classMatch) {
      const [, className, extendsClass, implementsStr] = classMatch;
      const implementsInterfaces = implementsStr
        ? implementsStr.split(",").map((s) => s.trim())
        : [];

      return {
        className,
        extendsClass,
        implementsInterfaces,
        classLine: i,
      };
    }

    // Interface
    const interfaceMatch = line.match(
      /(?:public\s+)?interface\s+(\w+)(?:\s+extends\s+([\w,\s]+))?/,
    );
    if (interfaceMatch) {
      const [, className, extendsStr] = interfaceMatch;
      const implementsInterfaces = extendsStr
        ? extendsStr.split(",").map((s) => s.trim())
        : [];

      return {
        className,
        implementsInterfaces,
        classLine: i,
      };
    }
  }

  return {
    className: "",
    implementsInterfaces: [],
    classLine: 0,
  };
}

/**
 * Parse methods
 */
function parseMethods(lines: string[]): JavaMethod[] {
  const methods: JavaMethod[] = [];
  const methodRegex =
    /^\s*(public|private|protected)?\s*(?:static\s+)?(?:final\s+)?(?:<[\w,\s]+>\s+)?(\w+(?:<[\w,\s<>]+>)?)\s+(\w+)\s*\(/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(methodRegex);

    if (match) {
      const [, modifier, returnType, name] = match;

      // Bỏ qua constructors
      if (returnType === name) continue;

      // Tìm annotations phía trên
      let annotationStartLine = i - 1;
      while (
        annotationStartLine >= 0 &&
        (lines[annotationStartLine].trim().startsWith("@") ||
          lines[annotationStartLine].trim() === "")
      ) {
        annotationStartLine--;
      }
      annotationStartLine++;

      const annotations = parseAnnotations(lines, annotationStartLine);

      // Tìm end line (đếm braces)
      let braceCount = 0;
      let endLine = i;
      let foundOpenBrace = false;

      for (let j = i; j < lines.length; j++) {
        const currentLine = lines[j];
        for (const char of currentLine) {
          if (char === "{") {
            braceCount++;
            foundOpenBrace = true;
          } else if (char === "}") {
            braceCount--;
          }
        }

        if (foundOpenBrace && braceCount === 0) {
          endLine = j;
          break;
        }
      }

      methods.push({
        name,
        returnType,
        annotations,
        line: i + 1,
        endLine: endLine + 1,
        modifier: (modifier as "public" | "private" | "protected") || "default",
      });
    }
  }

  return methods;
}

/**
 * Parse fields
 */
function parseFields(lines: string[]): JavaField[] {
  const fields: JavaField[] = [];
  const fieldRegex =
    /^\s*(public|private|protected)?\s*(?:static\s+)?(?:final\s+)?(\w+(?:<[\w,\s<>]+>)?)\s+(\w+)\s*[;=]/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Bỏ qua method declarations
    if (line.includes("(")) continue;

    const match = line.match(fieldRegex);
    if (match) {
      const [, , type, name] = match;

      // Bỏ qua class/interface declarations
      if (type === "class" || type === "interface" || type === "enum") continue;

      // Tìm annotations phía trên
      let annotationStartLine = i - 1;
      while (
        annotationStartLine >= 0 &&
        (lines[annotationStartLine].trim().startsWith("@") ||
          lines[annotationStartLine].trim() === "")
      ) {
        annotationStartLine--;
      }
      annotationStartLine++;

      const annotations = parseAnnotations(lines, annotationStartLine);

      fields.push({
        name,
        type,
        annotations,
        line: i + 1,
      });
    }
  }

  return fields;
}

/**
 * Parse comments từ Java file
 */
function parseJavaComments(content: string, lines: string[]): CommentInfo[] {
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

  // Block comments và Javadoc
  const blockCommentRegex = /\/\*[\s\S]*?\*\//g;
  let match;
  while ((match = blockCommentRegex.exec(content)) !== null) {
    const startIndex = match.index;
    const endIndex = startIndex + match[0].length;

    const beforeStart = content.substring(0, startIndex);
    const startLine = (beforeStart.match(/\n/g) || []).length + 1;

    const beforeEnd = content.substring(0, endIndex);
    const endLine = (beforeEnd.match(/\n/g) || []).length + 1;

    comments.push({
      content: match[0]
        .replace(/^\/\*\*?\s*|\s*\*\/$/g, "")
        .replace(/^\s*\*\s?/gm, "")
        .trim(),
      line: startLine,
      endLine,
      isBlock: true,
    });
  }

  return comments;
}

/**
 * Parse file Java
 */
export async function parseJavaFile(file: FileInfo): Promise<ParsedJavaFile> {
  const content = fs.readFileSync(file.path, "utf-8");
  const lines = content.split("\n");

  const packageName = parsePackageName(lines);
  const { className, extendsClass, implementsInterfaces, classLine } =
    parseClassDeclaration(lines);

  // Parse class annotations (phía trên class declaration)
  let annotationStartLine = classLine - 1;
  while (
    annotationStartLine >= 0 &&
    (lines[annotationStartLine].trim().startsWith("@") ||
      lines[annotationStartLine].trim() === "" ||
      lines[annotationStartLine].trim().startsWith("import") ||
      lines[annotationStartLine].trim().startsWith("package"))
  ) {
    annotationStartLine--;
  }
  annotationStartLine++;

  // Chỉ lấy annotations, không lấy import/package
  const classAnnotationLines = lines.slice(annotationStartLine, classLine);
  const classAnnotations = parseAnnotations(classAnnotationLines, 0);

  return {
    file,
    lines,
    lineCount: lines.length,
    imports: [], // Java imports được xử lý khác
    exports: [],
    comments: parseJavaComments(content, lines),
    hasUseClient: false,
    hasUseServer: false,
    content,
    className,
    packageName,
    classAnnotations,
    methods: parseMethods(lines),
    fields: parseFields(lines),
    extendsClass,
    implementsInterfaces,
  };
}
