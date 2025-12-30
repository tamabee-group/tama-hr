/**
 * Performance Rules (FE-PERF-001, FE-PERF-002)
 * Check code compliance with performance best practices
 */

import { BaseRule } from "../../interfaces/rule";
import type { ParsedFile, RuleContext, Violation } from "../../types";

/**
 * FE-PERF-001: Use next/image
 * Detect images not using next/image
 */
export class NextImageRule extends BaseRule {
  id = "FE-PERF-001";
  name = "Use next/image";
  category = "performance" as const;
  severity = "warning" as const;
  description = "Use next/image to optimize images";
  projectType = "frontend" as const;
  canAutoFix = true;

  check(file: ParsedFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Pattern to detect <img> tags
    const imgPattern = /<img\s+[^>]*src\s*=/gi;

    for (let i = 0; i < file.lines.length; i++) {
      const line = file.lines[i];

      // Skip comments
      if (line.trim().startsWith("//") || line.trim().startsWith("*")) {
        continue;
      }

      let match;
      while ((match = imgPattern.exec(line)) !== null) {
        // Check if it's Image component from next/image (PascalCase)
        if (line.includes("<Image")) {
          continue;
        }

        violations.push(
          this.createViolation({
            file: file.file.relativePath,
            line: i + 1,
            column: match.index + 1,
            message: "Using <img> tag instead of next/image",
            suggestion: "Use <Image> component from 'next/image' to optimize",
            codeSnippet: line.trim(),
            fixCode: line.replace(/<img/g, "<Image"),
          }),
        );
      }
      imgPattern.lastIndex = 0;
    }

    return violations;
  }
}

/**
 * FE-PERF-002: Use Suspense boundaries
 * Detect components without Suspense boundaries
 */
export class SuspenseBoundaryRule extends BaseRule {
  id = "FE-PERF-002";
  name = "Use Suspense boundaries";
  category = "performance" as const;
  severity = "info" as const;
  description = "Use Suspense boundaries with skeleton loaders";
  projectType = "frontend" as const;
  canAutoFix = false;

  check(file: ParsedFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Only check page files
    if (!file.file.isPage) {
      return violations;
    }

    // Check if has async data fetching
    const hasAsyncFetch =
      file.content.includes("await ") ||
      file.content.includes("async function") ||
      file.content.includes("async (");

    if (!hasAsyncFetch) {
      return violations;
    }

    // Check if has Suspense
    const hasSuspense =
      file.content.includes("<Suspense") || file.content.includes("Suspense>");

    // Check if Suspense is imported
    const hasSuspenseImport = file.imports.some(
      (imp) => imp.source === "react" && imp.namedImports.includes("Suspense"),
    );

    if (!hasSuspense && !hasSuspenseImport) {
      violations.push(
        this.createViolation({
          file: file.file.relativePath,
          line: 1,
          column: 1,
          message: "Page has async data fetching but no Suspense boundary",
          suggestion:
            "Wrap async components with <Suspense fallback={<Loading />}> to improve UX",
          codeSnippet: "// Page without Suspense",
        }),
      );
    }

    // Check dynamic imports for heavy components
    const heavyComponentPatterns = [
      /Chart/i,
      /Editor/i,
      /Calendar/i,
      /DataGrid/i,
      /RichText/i,
      /Map/i,
    ];

    for (let i = 0; i < file.lines.length; i++) {
      const line = file.lines[i];

      for (const pattern of heavyComponentPatterns) {
        if (pattern.test(line) && line.includes("import")) {
          // Check if it's a dynamic import
          if (
            !line.includes("dynamic(") &&
            !line.includes("from 'next/dynamic'")
          ) {
            violations.push(
              this.createViolation({
                file: file.file.relativePath,
                line: i + 1,
                column: 1,
                message: `Heavy component import does not use dynamic()`,
                suggestion:
                  "Use dynamic() from 'next/dynamic' to lazy load heavy components",
                codeSnippet: line.trim(),
              }),
            );
          }
        }
      }
    }

    return violations;
  }
}
