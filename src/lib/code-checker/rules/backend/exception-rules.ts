/**
 * Exception Handling Rules (BE-EXC-001, BE-EXC-002, BE-EXC-003)
 * Check exception handling compliance with rules
 */

import { BaseRule } from "../../interfaces/rule";
import type { ParsedJavaFile, RuleContext, Violation } from "../../types";

/**
 * BE-EXC-001: Use ErrorCode enum
 * Verify ErrorCode enum from com.tamabee.api_hr.enums.ErrorCode is used
 */
export class ErrorCodeEnumRule extends BaseRule {
  id = "BE-EXC-001";
  name = "Use ErrorCode enum";
  category = "exception-handling" as const;
  severity = "error" as const;
  description = "Use ErrorCode enum instead of hardcoded error code strings";
  projectType = "backend" as const;
  canAutoFix = false;

  check(file: ParsedJavaFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Pattern to detect hardcoded error codes in exception
    // Example: throw new BadRequestException("INVALID_CREDENTIALS", ...)
    const hardcodedErrorPattern =
      /throw\s+new\s+\w+Exception\s*\(\s*["']([A-Z_]+)["']/g;

    for (let i = 0; i < file.lines.length; i++) {
      const line = file.lines[i];
      let match;

      while ((match = hardcodedErrorPattern.exec(line)) !== null) {
        const errorCode = match[1];

        violations.push(
          this.createViolation({
            file: file.file.relativePath,
            line: i + 1,
            column: match.index + 1,
            message: `Hardcoded error code "${errorCode}" in exception`,
            suggestion: `Use ErrorCode.${errorCode} from com.tamabee.api_hr.enums.ErrorCode`,
            codeSnippet: line.trim(),
          }),
        );
      }

      // Reset regex lastIndex
      hardcodedErrorPattern.lastIndex = 0;
    }

    return violations;
  }
}

/**
 * BE-EXC-002: Use custom exceptions
 * Suggest using custom exceptions (BadRequestException, NotFoundException, etc.)
 */
export class CustomExceptionRule extends BaseRule {
  id = "BE-EXC-002";
  name = "Use custom exceptions";
  category = "exception-handling" as const;
  severity = "warning" as const;
  description = "Use custom exceptions instead of generic exceptions";
  projectType = "backend" as const;
  canAutoFix = false;

  check(file: ParsedJavaFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Pattern to detect generic exceptions
    const genericExceptions = [
      "RuntimeException",
      "Exception",
      "IllegalArgumentException",
      "IllegalStateException",
    ];

    const pattern = new RegExp(
      `throw\\s+new\\s+(${genericExceptions.join("|")})\\s*\\(`,
      "g",
    );

    for (let i = 0; i < file.lines.length; i++) {
      const line = file.lines[i];
      let match;

      while ((match = pattern.exec(line)) !== null) {
        const exceptionType = match[1];

        violations.push(
          this.createViolation({
            file: file.file.relativePath,
            line: i + 1,
            column: match.index + 1,
            message: `Using generic exception ${exceptionType}`,
            suggestion:
              "Use custom exceptions: BadRequestException, NotFoundException, UnauthorizedException, ForbiddenException, ConflictException, InternalServerException",
            codeSnippet: line.trim(),
          }),
        );
      }

      // Reset regex lastIndex
      pattern.lastIndex = 0;
    }

    return violations;
  }
}

/**
 * BE-EXC-003: Use factory methods
 * Verify static factory methods are used (e.g., NotFoundException.user(id))
 */
export class ExceptionFactoryMethodRule extends BaseRule {
  id = "BE-EXC-003";
  name = "Use factory methods";
  category = "exception-handling" as const;
  severity = "info" as const;
  description = "Prefer using static factory methods for exceptions";
  projectType = "backend" as const;
  canAutoFix = false;

  check(file: ParsedJavaFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Custom exceptions with factory methods
    const customExceptions = [
      "BadRequestException",
      "NotFoundException",
      "UnauthorizedException",
      "ForbiddenException",
      "ConflictException",
      "InternalServerException",
    ];

    // Pattern to detect new CustomException(...) instead of CustomException.xxx()
    const pattern = new RegExp(
      `throw\\s+new\\s+(${customExceptions.join("|")})\\s*\\(`,
      "g",
    );

    for (let i = 0; i < file.lines.length; i++) {
      const line = file.lines[i];
      let match;

      while ((match = pattern.exec(line)) !== null) {
        const exceptionType = match[1];

        violations.push(
          this.createViolation({
            file: file.file.relativePath,
            line: i + 1,
            column: match.index + 1,
            message: `Using constructor instead of factory method for ${exceptionType}`,
            suggestion: `Prefer using factory methods: ${exceptionType}.user(id), ${exceptionType}.emailExists(email), etc.`,
            codeSnippet: line.trim(),
          }),
        );
      }

      // Reset regex lastIndex
      pattern.lastIndex = 0;
    }

    return violations;
  }
}
