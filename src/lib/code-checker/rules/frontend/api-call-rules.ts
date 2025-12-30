/**
 * API Call Rules (FE-API-001, FE-API-002, FE-API-003, FE-API-004)
 * Check API calls use correct utilities
 */

import { BaseRule } from "../../interfaces/rule";
import type { ParsedFile, RuleContext, Violation } from "../../types";

/**
 * FE-API-001: Client components must use apiClient
 * Verify API calls in client components use apiClient from @/lib/utils/fetch-client
 */
export class ApiClientRule extends BaseRule {
  id = "FE-API-001";
  name = "Use apiClient in client components";
  category = "api-calls" as const;
  severity = "warning" as const;
  description =
    "Client components must use apiClient from @/lib/utils/fetch-client";
  projectType = "frontend" as const;
  canAutoFix = false;

  check(file: ParsedFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Only check client components
    if (!file.hasUseClient) {
      return violations;
    }

    // Check if apiClient is imported
    const hasApiClientImport = file.imports.some(
      (imp) =>
        imp.source.includes("fetch-client") &&
        (imp.namedImports.includes("apiClient") ||
          imp.defaultImport === "apiClient"),
    );

    // Find API calls (fetch, axios, etc.) not using apiClient
    const fetchPattern = /\bfetch\s*\(/g;
    const axiosPattern = /\baxios\s*\.\s*(get|post|put|delete|patch)\s*\(/gi;

    for (let i = 0; i < file.lines.length; i++) {
      const line = file.lines[i];

      // Check fetch calls
      let match;
      while ((match = fetchPattern.exec(line)) !== null) {
        // Skip if apiClient is imported and being used
        if (hasApiClientImport && line.includes("apiClient")) {
          continue;
        }

        violations.push(
          this.createViolation({
            file: file.file.relativePath,
            line: i + 1,
            column: match.index + 1,
            message: "Using fetch() directly in client component",
            suggestion: "Use apiClient from @/lib/utils/fetch-client",
            codeSnippet: line.trim(),
          }),
        );
      }
      fetchPattern.lastIndex = 0;

      // Check axios calls
      while ((match = axiosPattern.exec(line)) !== null) {
        violations.push(
          this.createViolation({
            file: file.file.relativePath,
            line: i + 1,
            column: match.index + 1,
            message: "Using axios directly in client component",
            suggestion: "Use apiClient from @/lib/utils/fetch-client",
            codeSnippet: line.trim(),
          }),
        );
      }
      axiosPattern.lastIndex = 0;
    }

    return violations;
  }
}

/**
 * FE-API-002: Server components must use apiServer
 * Verify API calls in server components use apiServer from @/lib/utils/fetch-server
 */
export class ApiServerRule extends BaseRule {
  id = "FE-API-002";
  name = "Use apiServer in server components";
  category = "api-calls" as const;
  severity = "warning" as const;
  description =
    "Server components must use apiServer from @/lib/utils/fetch-server";
  projectType = "frontend" as const;
  canAutoFix = false;

  check(file: ParsedFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Only check server components (no 'use client')
    if (file.hasUseClient) {
      return violations;
    }

    // Skip non-component/page files
    if (!file.file.isPage && !file.file.isComponent) {
      return violations;
    }

    // Check if apiServer is imported
    const hasApiServerImport = file.imports.some(
      (imp) =>
        imp.source.includes("fetch-server") &&
        (imp.namedImports.includes("apiServer") ||
          imp.defaultImport === "apiServer"),
    );

    // Find API calls not using apiServer
    const fetchPattern = /\bfetch\s*\(/g;

    for (let i = 0; i < file.lines.length; i++) {
      const line = file.lines[i];

      let match;
      while ((match = fetchPattern.exec(line)) !== null) {
        // Skip if apiServer is imported and being used
        if (hasApiServerImport && line.includes("apiServer")) {
          continue;
        }

        // Skip comments
        if (line.trim().startsWith("//") || line.trim().startsWith("*")) {
          continue;
        }

        violations.push(
          this.createViolation({
            file: file.file.relativePath,
            line: i + 1,
            column: match.index + 1,
            message: "Using fetch() directly in server component",
            suggestion: "Use apiServer from @/lib/utils/fetch-server",
            codeSnippet: line.trim(),
          }),
        );
      }
      fetchPattern.lastIndex = 0;
    }

    return violations;
  }
}

/**
 * FE-API-003: Do not use fetch() directly
 * Detect direct fetch() calls without using apiClient/apiServer
 */
export class DirectFetchRule extends BaseRule {
  id = "FE-API-003";
  name = "No direct fetch calls";
  category = "api-calls" as const;
  severity = "warning" as const;
  description = "Do not use fetch() directly, use apiClient or apiServer";
  projectType = "frontend" as const;
  canAutoFix = false;

  check(file: ParsedFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Skip utility files (fetch-client, fetch-server)
    if (
      file.file.relativePath.includes("fetch-client") ||
      file.file.relativePath.includes("fetch-server")
    ) {
      return violations;
    }

    // Check if apiClient or apiServer is imported
    const hasApiImport = file.imports.some(
      (imp) =>
        imp.source.includes("fetch-client") ||
        imp.source.includes("fetch-server"),
    );

    // Skip if api utilities are imported
    if (hasApiImport) {
      return violations;
    }

    // Find fetch calls
    const fetchPattern = /\bfetch\s*\(\s*['"`]/g;

    for (let i = 0; i < file.lines.length; i++) {
      const line = file.lines[i];

      // Skip comments
      if (line.trim().startsWith("//") || line.trim().startsWith("*")) {
        continue;
      }

      let match;
      while ((match = fetchPattern.exec(line)) !== null) {
        violations.push(
          this.createViolation({
            file: file.file.relativePath,
            line: i + 1,
            column: match.index + 1,
            message: "Using fetch() directly",
            suggestion:
              "Use apiClient (client) or apiServer (server) from @/lib/utils/",
            codeSnippet: line.trim(),
          }),
        );
      }
      fetchPattern.lastIndex = 0;
    }

    return violations;
  }
}

/**
 * FE-API-004: Declare pagination constants
 * Verify DEFAULT_PAGE and DEFAULT_LIMIT constants are declared for paginated API calls
 */
export class PaginationConstantsRule extends BaseRule {
  id = "FE-API-004";
  name = "Declare pagination constants";
  category = "api-calls" as const;
  severity = "warning" as const;
  description =
    "Declare DEFAULT_PAGE and DEFAULT_LIMIT constants for paginated API calls";
  projectType = "frontend" as const;
  canAutoFix = true;

  check(file: ParsedFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Find API calls with pagination params
    const paginationPattern = /\b(page|limit|pageSize|perPage)\s*[=:]/gi;
    let hasPaginationCall = false;

    for (const line of file.lines) {
      if (paginationPattern.test(line)) {
        hasPaginationCall = true;
        break;
      }
      paginationPattern.lastIndex = 0;
    }

    if (!hasPaginationCall) {
      return violations;
    }

    // Check if constants are declared
    const hasDefaultPage = file.content.includes("DEFAULT_PAGE");
    const hasDefaultLimit =
      file.content.includes("DEFAULT_LIMIT") ||
      file.content.includes("DEFAULT_PAGE_SIZE");

    if (!hasDefaultPage || !hasDefaultLimit) {
      // Find first line with pagination
      for (let i = 0; i < file.lines.length; i++) {
        const line = file.lines[i];
        if (paginationPattern.test(line)) {
          const missing = [];
          if (!hasDefaultPage) missing.push("DEFAULT_PAGE");
          if (!hasDefaultLimit) missing.push("DEFAULT_LIMIT");

          violations.push(
            this.createViolation({
              file: file.file.relativePath,
              line: i + 1,
              column: 1,
              message: `Missing constants declaration: ${missing.join(", ")}`,
              suggestion:
                "Add const DEFAULT_PAGE = 0; const DEFAULT_LIMIT = 10; at the top of the file",
              codeSnippet: line.trim(),
              fixCode: "const DEFAULT_PAGE = 0;\nconst DEFAULT_LIMIT = 10;",
            }),
          );
          break;
        }
        paginationPattern.lastIndex = 0;
      }
    }

    return violations;
  }
}
