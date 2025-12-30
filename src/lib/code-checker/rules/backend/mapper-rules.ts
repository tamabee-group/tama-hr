/**
 * Mapper Rules (BE-MAP-001, BE-MAP-002)
 * Check mapper classes compliance with rules
 */

import { BaseRule } from "../../interfaces/rule";
import type { ParsedJavaFile, RuleContext, Violation } from "../../types";

/**
 * BE-MAP-001: Null check in mapper
 * Verify Mapper methods have null check at beginning
 */
export class MapperNullCheckRule extends BaseRule {
  id = "BE-MAP-001";
  name = "Null check in mapper";
  category = "mapper" as const;
  severity = "warning" as const;
  description = "Mapper methods MUST have null check at the beginning";
  projectType = "backend" as const;
  canAutoFix = false;

  check(file: ParsedJavaFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Only check Mapper
    if (!file.file.isMapper) return violations;

    // Mapper methods that need null check
    const mapperMethodPatterns = [
      /^to[A-Z]/, // toEntity, toResponse, toDto
      /^map[A-Z]/, // mapToEntity, mapToResponse
      /^convert[A-Z]/, // convertToEntity
      /^update[A-Z]/, // updateEntity
    ];

    for (const method of file.methods) {
      // Check if it's a mapper method
      const isMapperMethod = mapperMethodPatterns.some((pattern) =>
        pattern.test(method.name),
      );

      if (!isMapperMethod) continue;

      // Get method body
      const methodStartLine = method.line - 1;
      const methodEndLine = method.endLine - 1;
      const methodBody = file.lines
        .slice(methodStartLine, methodEndLine + 1)
        .join("\n");

      // Check if has null check at beginning
      const hasNullCheck =
        methodBody.includes("if (") &&
        (methodBody.includes("== null") || methodBody.includes("= null"));

      // Find first line of method body (after {)
      let bodyStartLine = methodStartLine;
      for (let i = methodStartLine; i <= methodEndLine; i++) {
        if (file.lines[i].includes("{")) {
          bodyStartLine = i + 1;
          break;
        }
      }

      // Check if first line is null check
      const firstBodyLine = file.lines[bodyStartLine]?.trim() || "";
      const hasNullCheckFirst =
        firstBodyLine.startsWith("if (") &&
        (firstBodyLine.includes("== null") || firstBodyLine.includes("= null"));

      if (!hasNullCheck) {
        violations.push(
          this.createViolation({
            file: file.file.relativePath,
            line: method.line,
            message: `Mapper method ${method.name} missing null check`,
            suggestion:
              "Add null check at the beginning of method: if (param == null) return null;",
            codeSnippet: `${method.returnType} ${method.name}(...)`,
          }),
        );
      } else if (!hasNullCheckFirst) {
        violations.push(
          this.createViolation({
            file: file.file.relativePath,
            line: method.line,
            message: `Mapper method ${method.name} has null check but not at the beginning of method`,
            suggestion: "Move null check to the beginning of method",
            codeSnippet: `${method.returnType} ${method.name}(...)`,
          }),
        );
      }
    }

    return violations;
  }
}

/**
 * BE-MAP-002: Required mapper methods
 * Verify Mapper classes have required methods: toEntity(), toResponse(), updateEntity()
 */
export class RequiredMapperMethodsRule extends BaseRule {
  id = "BE-MAP-002";
  name = "Required mapper methods";
  category = "mapper" as const;
  severity = "warning" as const;
  description =
    "Mapper classes MUST have methods: toEntity(), toResponse(), updateEntity()";
  projectType = "backend" as const;
  canAutoFix = false;

  check(file: ParsedJavaFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Only check Mapper
    if (!file.file.isMapper) return violations;

    // Required methods
    const requiredMethods = ["toEntity", "toResponse", "updateEntity"];

    // Get list of method names
    const methodNames = file.methods.map((m) => m.name);

    for (const requiredMethod of requiredMethods) {
      // Check if has method with name starting with required method
      const hasMethod = methodNames.some(
        (name) => name === requiredMethod || name.startsWith(requiredMethod),
      );

      if (!hasMethod) {
        violations.push(
          this.createViolation({
            file: file.file.relativePath,
            line: 1,
            message: `Mapper class ${file.className} missing method ${requiredMethod}()`,
            suggestion: `Add method ${requiredMethod}() to Mapper class`,
            codeSnippet: `class ${file.className}`,
          }),
        );
      }
    }

    return violations;
  }
}
