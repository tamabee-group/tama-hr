/**
 * Response Rules (BE-RESP-001, BE-RESP-002, BE-RESP-003)
 * Check API responses compliance with rules
 */

import { BaseRule } from "../../interfaces/rule";
import type { ParsedJavaFile, RuleContext, Violation } from "../../types";

/**
 * BE-RESP-001: Return ResponseEntity<BaseResponse<T>>
 * Verify Controller methods return ResponseEntity<BaseResponse<T>>
 */
export class ResponseEntityRule extends BaseRule {
  id = "BE-RESP-001";
  name = "Return ResponseEntity<BaseResponse>";
  category = "response" as const;
  severity = "error" as const;
  description =
    "Controller methods MUST return ResponseEntity<BaseResponse<T>>";
  projectType = "backend" as const;
  canAutoFix = false;

  check(file: ParsedJavaFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Only check Controller
    if (!file.file.isController) return violations;

    for (const method of file.methods) {
      // Only check public methods with HTTP annotations
      const hasHttpAnnotation = method.annotations.some((ann) =>
        [
          "GetMapping",
          "PostMapping",
          "PutMapping",
          "DeleteMapping",
          "PatchMapping",
          "RequestMapping",
        ].includes(ann.name),
      );

      if (!hasHttpAnnotation) continue;

      const returnType = method.returnType;

      // Check return type
      if (!returnType.includes("ResponseEntity")) {
        violations.push(
          this.createViolation({
            file: file.file.relativePath,
            line: method.line,
            message: `Method ${method.name} does not return ResponseEntity`,
            suggestion: `Change return type to ResponseEntity<BaseResponse<${returnType}>>`,
            codeSnippet: `${returnType} ${method.name}(...)`,
          }),
        );
      } else if (!returnType.includes("BaseResponse")) {
        violations.push(
          this.createViolation({
            file: file.file.relativePath,
            line: method.line,
            message: `Method ${method.name} returns ResponseEntity but not wrapped in BaseResponse`,
            suggestion:
              "Use ResponseEntity<BaseResponse<T>> to ensure consistent API response format",
            codeSnippet: `${returnType} ${method.name}(...)`,
          }),
        );
      }
    }

    return violations;
  }
}

/**
 * BE-RESP-002: Use BaseResponse methods
 * Verify BaseResponse.success(), BaseResponse.created(), or BaseResponse.error() is used
 */
export class BaseResponseMethodsRule extends BaseRule {
  id = "BE-RESP-002";
  name = "Use BaseResponse methods";
  category = "response" as const;
  severity = "warning" as const;
  description =
    "Use BaseResponse.success(), BaseResponse.created(), BaseResponse.error()";
  projectType = "backend" as const;
  canAutoFix = false;

  check(file: ParsedJavaFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Only check Controller
    if (!file.file.isController) return violations;

    // Pattern to detect new BaseResponse(...) instead of static methods
    const newBaseResponsePattern = /new\s+BaseResponse\s*[<(]/g;

    for (let i = 0; i < file.lines.length; i++) {
      const line = file.lines[i];
      let match;

      while ((match = newBaseResponsePattern.exec(line)) !== null) {
        violations.push(
          this.createViolation({
            file: file.file.relativePath,
            line: i + 1,
            column: match.index + 1,
            message:
              "Using constructor instead of static methods for BaseResponse",
            suggestion:
              "Use BaseResponse.success(data), BaseResponse.created(data), or BaseResponse.error(errorCode, message)",
            codeSnippet: line.trim(),
          }),
        );
      }

      // Reset regex lastIndex
      newBaseResponsePattern.lastIndex = 0;
    }

    return violations;
  }
}

/**
 * BE-RESP-003: Pageable for list APIs
 * Verify Pageable parameter exists for list APIs
 */
export class PageableParameterRule extends BaseRule {
  id = "BE-RESP-003";
  name = "Pageable for list APIs";
  category = "response" as const;
  severity = "warning" as const;
  description = "List APIs MUST have Pageable parameter";
  projectType = "backend" as const;
  canAutoFix = false;

  check(file: ParsedJavaFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Only check Controller
    if (!file.file.isController) return violations;

    for (const method of file.methods) {
      // Only check GET methods
      const hasGetMapping = method.annotations.some(
        (ann) =>
          ann.name === "GetMapping" ||
          (ann.name === "RequestMapping" &&
            ann.parameters["method"]?.includes("GET")),
      );

      if (!hasGetMapping) continue;

      // Check if return type is List/Page
      const returnType = method.returnType;
      const isListReturn =
        returnType.includes("List") ||
        returnType.includes("Page") ||
        returnType.includes("Collection");

      if (!isListReturn) continue;

      // Find method signature to check Pageable parameter
      const methodLine = file.lines[method.line - 1];
      const hasPageable = methodLine.includes("Pageable");

      if (!hasPageable) {
        violations.push(
          this.createViolation({
            file: file.file.relativePath,
            line: method.line,
            message: `List API ${method.name} missing Pageable parameter`,
            suggestion: "Add Pageable pageable parameter to support pagination",
            codeSnippet: methodLine.trim(),
          }),
        );
      }
    }

    return violations;
  }
}
