/**
 * Auth Rules (FE-AUTH-001, FE-AUTH-002)
 * Check authentication code compliance with security patterns
 */

import { BaseRule } from "../../interfaces/rule";
import type { ParsedFile, RuleContext, Violation } from "../../types";

/**
 * FE-AUTH-001: Use useAuth() hook
 * Verify useAuth() hook is used for accessing user info
 */
export class UseAuthHookRule extends BaseRule {
  id = "FE-AUTH-001";
  name = "Use useAuth hook";
  category = "authentication" as const;
  severity = "warning" as const;
  description = "Use useAuth() hook to access user information";
  projectType = "frontend" as const;
  canAutoFix = false;

  check(file: ParsedFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Only check client components
    if (!file.hasUseClient) {
      return violations;
    }

    // Patterns to detect user info access without useAuth
    const userAccessPatterns = [
      /\buser\s*\.\s*(id|email|name|role|companyId)\b/g,
      /\bcurrentUser\s*\.\s*(id|email|name|role)\b/g,
      /\bsession\s*\.\s*user\b/g,
    ];

    // Check if useAuth is imported
    const hasUseAuthImport = file.imports.some(
      (imp) =>
        imp.namedImports.includes("useAuth") || imp.source.includes("/auth"),
    );

    // Check if useAuth is used in the file
    const usesUseAuth =
      file.content.includes("useAuth()") || file.content.includes("useAuth(");

    // Skip if useAuth is already used
    if (hasUseAuthImport && usesUseAuth) {
      return violations;
    }

    for (let i = 0; i < file.lines.length; i++) {
      const line = file.lines[i];

      // Skip comments
      if (line.trim().startsWith("//") || line.trim().startsWith("*")) {
        continue;
      }

      for (const pattern of userAccessPatterns) {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          violations.push(
            this.createViolation({
              file: file.file.relativePath,
              line: i + 1,
              column: match.index + 1,
              message: "Accessing user info without useAuth() hook",
              suggestion: "Use const { user } = useAuth() from @/lib/auth",
              codeSnippet: line.trim(),
            }),
          );
        }
        pattern.lastIndex = 0;
      }
    }

    return violations;
  }
}

/**
 * FE-AUTH-002: Do not access localStorage directly for auth data
 * Detect direct localStorage access for auth data
 */
export class DirectLocalStorageRule extends BaseRule {
  id = "FE-AUTH-002";
  name = "No direct localStorage for auth";
  category = "authentication" as const;
  severity = "warning" as const;
  description =
    "Do not access localStorage directly for auth data, use functions from @/lib/auth";
  projectType = "frontend" as const;
  canAutoFix = false;

  check(file: ParsedFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Skip auth utility files
    if (
      file.file.relativePath.includes("/auth/") ||
      file.file.relativePath.includes("/lib/auth")
    ) {
      return violations;
    }

    // Patterns to detect localStorage access for auth
    const authStoragePatterns = [
      /localStorage\s*\.\s*getItem\s*\(\s*['"`](token|accessToken|refreshToken|user|auth|session)['"`]\s*\)/gi,
      /localStorage\s*\.\s*setItem\s*\(\s*['"`](token|accessToken|refreshToken|user|auth|session)['"`]/gi,
      /localStorage\s*\.\s*removeItem\s*\(\s*['"`](token|accessToken|refreshToken|user|auth|session)['"`]\s*\)/gi,
      /sessionStorage\s*\.\s*getItem\s*\(\s*['"`](token|accessToken|refreshToken|user|auth|session)['"`]\s*\)/gi,
    ];

    for (let i = 0; i < file.lines.length; i++) {
      const line = file.lines[i];

      // Skip comments
      if (line.trim().startsWith("//") || line.trim().startsWith("*")) {
        continue;
      }

      for (const pattern of authStoragePatterns) {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          violations.push(
            this.createViolation({
              file: file.file.relativePath,
              line: i + 1,
              column: match.index + 1,
              message: `Accessing localStorage/sessionStorage directly for auth data: ${match[0]}`,
              suggestion:
                "Use functions from @/lib/auth like getToken(), setToken(), removeToken()",
              codeSnippet: line.trim(),
            }),
          );
        }
        pattern.lastIndex = 0;
      }
    }

    return violations;
  }
}
