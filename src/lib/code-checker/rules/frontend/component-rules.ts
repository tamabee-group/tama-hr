/**
 * Component Rules (FE-COMP-001, FE-COMP-002, FE-COMP-003)
 * Check components compliance with size and structure rules
 */

import * as path from "path";
import { BaseRule } from "../../interfaces/rule";
import type { ParsedFile, RuleContext, Violation } from "../../types";

/**
 * FE-COMP-001: Component should not exceed 250 lines
 * Flag component files exceeding 250 lines
 */
export class ComponentSizeRule extends BaseRule {
  id = "FE-COMP-001";
  name = "Max 250 lines per component";
  category = "components" as const;
  severity = "warning" as const;
  description = "Component should not exceed 250 lines, consider splitting";
  projectType = "frontend" as const;
  canAutoFix = false;

  private readonly MAX_LINES = 250;

  check(file: ParsedFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Only check component files
    if (!file.file.isComponent && !file.file.isPage) {
      return violations;
    }

    if (file.lineCount > this.MAX_LINES) {
      violations.push(
        this.createViolation({
          file: file.file.relativePath,
          line: 1,
          column: 1,
          message: `Component has ${file.lineCount} lines, exceeds limit of ${this.MAX_LINES} lines`,
          suggestion:
            "Split component into smaller sub-components or extract logic into custom hooks",
          codeSnippet: `// File has ${file.lineCount} lines`,
        }),
      );
    }

    return violations;
  }
}

/**
 * FE-COMP-002: page.tsx must not have 'use client'
 * Verify page.tsx files do NOT contain 'use client' directive
 */
export class PageUseClientRule extends BaseRule {
  id = "FE-COMP-002";
  name = "No 'use client' in page.tsx";
  category = "components" as const;
  severity = "error" as const;
  description =
    "page.tsx must be a Server Component, must not have 'use client'";
  projectType = "frontend" as const;
  canAutoFix = false;

  check(file: ParsedFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Only check page.tsx files
    if (!file.file.isPage) {
      return violations;
    }

    if (file.hasUseClient) {
      // Find line with 'use client'
      let useClientLine = 1;
      for (let i = 0; i < file.lines.length; i++) {
        const line = file.lines[i].trim();
        if (line === "'use client'" || line === '"use client"') {
          useClientLine = i + 1;
          break;
        }
      }

      violations.push(
        this.createViolation({
          file: file.file.relativePath,
          line: useClientLine,
          column: 1,
          message: "page.tsx contains 'use client' directive",
          suggestion:
            "Extract interactive logic into internal component with '_' prefix (e.g., _page-content.tsx)",
          codeSnippet: "'use client'",
        }),
      );
    }

    return violations;
  }
}

/**
 * FE-COMP-003: Internal components must have underscore prefix
 * Verify internal component filenames start with underscore prefix
 */
export class InternalComponentPrefixRule extends BaseRule {
  id = "FE-COMP-003";
  name = "Internal components prefix underscore";
  category = "components" as const;
  severity = "warning" as const;
  description =
    "Internal components must have underscore prefix (_component-name.tsx)";
  projectType = "frontend" as const;
  canAutoFix = true;

  check(file: ParsedFile, context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Only check component files
    if (!file.file.isComponent) {
      return violations;
    }

    const fileName = path.basename(file.file.relativePath);
    const dirPath = path.dirname(file.file.relativePath);

    // Skip files in ui/ folder (shadcn components)
    if (dirPath.includes("/ui/") || dirPath.includes("\\ui\\")) {
      return violations;
    }

    // Skip files that already have underscore prefix
    if (fileName.startsWith("_")) {
      return violations;
    }

    // Skip files in _components folder (already internal)
    if (dirPath.includes("/_components") || dirPath.includes("\\_components")) {
      return violations;
    }

    // Check if component is exported externally
    // If only used in same folder, should have underscore prefix
    const normalizedPath = file.file.relativePath.replace(/\\/g, "/");

    // Count how many times component is imported from other folders
    let externalImportCount = 0;
    for (const otherFile of context.allFiles) {
      if (otherFile.path === file.file.path) continue;

      const otherDir = path.dirname(otherFile.relativePath).replace(/\\/g, "/");
      const currentDir = path.dirname(normalizedPath);

      // If imported from different folder
      if (otherDir !== currentDir) {
        // Check in import graph
        const imports = context.importGraph.imports.get(otherFile.relativePath);
        if (
          imports?.some((imp) => imp.includes(fileName.replace(".tsx", "")))
        ) {
          externalImportCount++;
        }
      }
    }

    // If no external imports, suggest adding prefix
    if (externalImportCount === 0) {
      violations.push(
        this.createViolation({
          file: file.file.relativePath,
          line: 1,
          column: 1,
          message: `Internal component "${fileName}" does not have underscore prefix`,
          suggestion: `Rename to "_${fileName}" to mark as internal component`,
          codeSnippet: fileName,
          fixCode: `_${fileName}`,
        }),
      );
    }

    return violations;
  }
}
