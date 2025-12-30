/**
 * Naming Convention Rules (BE-NAME-001, BE-NAME-002, BE-NAME-003)
 * Check naming conventions compliance with rules
 */

import { BaseRule } from "../../interfaces/rule";
import type { ParsedJavaFile, RuleContext, Violation } from "../../types";

/**
 * BE-NAME-001: Entity naming pattern
 * Verify Entity classes follow naming pattern {Entity}Entity
 */
export class EntityNamingRule extends BaseRule {
  id = "BE-NAME-001";
  name = "Entity naming pattern";
  category = "naming" as const;
  severity = "warning" as const;
  description = "Entity classes MUST have suffix Entity: {Name}Entity";
  projectType = "backend" as const;
  canAutoFix = false;

  check(file: ParsedJavaFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Only check Entity
    if (!file.file.isEntity) return violations;

    const className = file.className;

    // Check if has @Entity annotation
    const hasEntityAnnotation = file.classAnnotations.some(
      (ann) => ann.name === "Entity",
    );

    if (hasEntityAnnotation && !className.endsWith("Entity")) {
      violations.push(
        this.createViolation({
          file: file.file.relativePath,
          line: 1,
          message: `Entity class ${className} does not have suffix Entity`,
          suggestion: `Rename to ${className}Entity`,
          codeSnippet: `class ${className}`,
        }),
      );
    }

    return violations;
  }
}

/**
 * BE-NAME-002: Mapper naming pattern
 * Verify Mapper classes follow naming pattern {Entity}Mapper
 */
export class MapperNamingRule extends BaseRule {
  id = "BE-NAME-002";
  name = "Mapper naming pattern";
  category = "naming" as const;
  severity = "warning" as const;
  description = "Mapper classes MUST have suffix Mapper: {Name}Mapper";
  projectType = "backend" as const;
  canAutoFix = false;

  check(file: ParsedJavaFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Only check Mapper
    if (!file.file.isMapper) return violations;

    const className = file.className;

    if (!className.endsWith("Mapper")) {
      violations.push(
        this.createViolation({
          file: file.file.relativePath,
          line: 1,
          message: `Mapper class ${className} does not have suffix Mapper`,
          suggestion: `Rename to ${className}Mapper`,
          codeSnippet: `class ${className}`,
        }),
      );
    }

    return violations;
  }
}

/**
 * BE-NAME-003: Constant UPPER_SNAKE_CASE
 * Verify constants use UPPER_SNAKE_CASE format
 */
export class ConstantNamingRule extends BaseRule {
  id = "BE-NAME-003";
  name = "Constant UPPER_SNAKE_CASE";
  category = "naming" as const;
  severity = "warning" as const;
  description = "Constants MUST use UPPER_SNAKE_CASE format";
  projectType = "backend" as const;
  canAutoFix = false;

  check(file: ParsedJavaFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Pattern to detect constants (static final fields)
    const constantPattern =
      /(?:public|private|protected)?\s*static\s+final\s+\w+\s+(\w+)\s*=/;

    for (let i = 0; i < file.lines.length; i++) {
      const line = file.lines[i];
      const match = line.match(constantPattern);

      if (match) {
        const constantName = match[1];

        // Check UPPER_SNAKE_CASE
        const isUpperSnakeCase = /^[A-Z][A-Z0-9_]*$/.test(constantName);

        // Skip serialVersionUID and logger
        const exceptions = [
          "serialVersionUID",
          "log",
          "logger",
          "LOG",
          "LOGGER",
        ];
        if (exceptions.includes(constantName)) continue;

        if (!isUpperSnakeCase) {
          // Suggest correct name
          const suggestedName = constantName
            .replace(/([a-z])([A-Z])/g, "$1_$2")
            .toUpperCase();

          violations.push(
            this.createViolation({
              file: file.file.relativePath,
              line: i + 1,
              message: `Constant ${constantName} does not use UPPER_SNAKE_CASE`,
              suggestion: `Rename to ${suggestedName}`,
              codeSnippet: line.trim(),
            }),
          );
        }
      }
    }

    return violations;
  }
}
