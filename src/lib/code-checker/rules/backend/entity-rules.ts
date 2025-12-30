/**
 * Entity Rules (BE-ENT-001, BE-ENT-002, BE-ENT-003)
 * Check entity classes compliance with rules
 */

import { BaseRule } from "../../interfaces/rule";
import type { ParsedJavaFile, RuleContext, Violation } from "../../types";

/**
 * BE-ENT-001: Extend BaseEntity
 * Verify Entity classes extend BaseEntity
 */
export class ExtendBaseEntityRule extends BaseRule {
  id = "BE-ENT-001";
  name = "Extend BaseEntity";
  category = "entity" as const;
  severity = "error" as const;
  description = "Entity classes MUST extend BaseEntity";
  projectType = "backend" as const;
  canAutoFix = false;

  check(file: ParsedJavaFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Only check Entity
    if (!file.file.isEntity) return violations;

    // Check if has @Entity annotation
    const hasEntityAnnotation = file.classAnnotations.some(
      (ann) => ann.name === "Entity",
    );

    if (!hasEntityAnnotation) return violations;

    // Check extends BaseEntity
    if (file.extendsClass !== "BaseEntity") {
      violations.push(
        this.createViolation({
          file: file.file.relativePath,
          line: 1,
          message: `Entity class ${file.className} does not extend BaseEntity`,
          suggestion: `Add extends BaseEntity to class declaration`,
          codeSnippet: `class ${file.className}${file.extendsClass ? ` extends ${file.extendsClass}` : ""}`,
        }),
      );
    }

    return violations;
  }
}

/**
 * BE-ENT-002: No @ManyToOne/@OneToMany
 * Verify Entity classes don't use @ManyToOne or @OneToMany annotations
 */
export class NoRelationshipAnnotationsRule extends BaseRule {
  id = "BE-ENT-002";
  name = "No @ManyToOne/@OneToMany";
  category = "entity" as const;
  severity = "error" as const;
  description =
    "Entity MUST NOT use @ManyToOne, @OneToMany - use Long for foreign key fields";
  projectType = "backend" as const;
  canAutoFix = false;

  check(file: ParsedJavaFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Only check Entity
    if (!file.file.isEntity) return violations;

    // Forbidden annotations
    const forbiddenAnnotations = [
      "ManyToOne",
      "OneToMany",
      "ManyToMany",
      "OneToOne",
    ];

    for (const field of file.fields) {
      for (const annotation of field.annotations) {
        if (forbiddenAnnotations.includes(annotation.name)) {
          violations.push(
            this.createViolation({
              file: file.file.relativePath,
              line: annotation.line,
              message: `Field ${field.name} uses @${annotation.name} annotation`,
              suggestion: `Replace with Long type for foreign key: Long ${field.name}Id`,
              codeSnippet: `@${annotation.name}`,
            }),
          );
        }
      }
    }

    return violations;
  }
}

/**
 * BE-ENT-003: Long type for foreign keys
 * Verify foreign key fields use Long type instead of entity references
 */
export class LongTypeForForeignKeyRule extends BaseRule {
  id = "BE-ENT-003";
  name = "Long type for foreign keys";
  category = "entity" as const;
  severity = "warning" as const;
  description =
    "Foreign key fields MUST use Long type instead of entity references";
  projectType = "backend" as const;
  canAutoFix = false;

  check(file: ParsedJavaFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Only check Entity
    if (!file.file.isEntity) return violations;

    // Pattern to detect entity references (fields with type ending in Entity)
    for (const field of file.fields) {
      const fieldType = field.type;

      // Check if type is entity reference
      if (
        fieldType.endsWith("Entity") &&
        !fieldType.includes("List") &&
        !fieldType.includes("Set")
      ) {
        violations.push(
          this.createViolation({
            file: file.file.relativePath,
            line: field.line,
            message: `Field ${field.name} uses entity reference ${fieldType}`,
            suggestion: `Replace with Long type: Long ${field.name}Id`,
            codeSnippet: `${fieldType} ${field.name}`,
          }),
        );
      }

      // Check if type is List/Set of entity
      if (
        (fieldType.includes("List<") || fieldType.includes("Set<")) &&
        fieldType.includes("Entity")
      ) {
        violations.push(
          this.createViolation({
            file: file.file.relativePath,
            line: field.line,
            message: `Field ${field.name} uses collection of entity references`,
            suggestion:
              "Do not use collection relationships in Entity. Use separate queries in Service layer",
            codeSnippet: `${fieldType} ${field.name}`,
          }),
        );
      }
    }

    return violations;
  }
}
