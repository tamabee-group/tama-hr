/**
 * Repository Rules (BE-REPO-001, BE-REPO-002)
 * Check repository queries compliance with rules
 */

import { BaseRule } from "../../interfaces/rule";
import type { ParsedJavaFile, RuleContext, Violation } from "../../types";

/**
 * BE-REPO-001: deleted=false check FIRST
 * Verify deleted = false check is FIRST in WHERE clause
 */
export class DeletedCheckFirstRule extends BaseRule {
  id = "BE-REPO-001";
  name = "deleted=false check first";
  category = "repository" as const;
  severity = "error" as const;
  description = "Query MUST have deleted = false check FIRST in WHERE clause";
  projectType = "backend" as const;
  canAutoFix = false;

  check(file: ParsedJavaFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Only check Repository
    if (!file.file.isRepository) return violations;

    // Pattern to detect @Query annotations
    const queryAnnotationPattern = /@Query\s*\(\s*["']([^"']+)["']/g;

    for (let i = 0; i < file.lines.length; i++) {
      const line = file.lines[i];
      let match;

      while ((match = queryAnnotationPattern.exec(line)) !== null) {
        const query = match[1].toLowerCase();

        // Check if query has WHERE clause
        if (query.includes("where")) {
          // Check if deleted = false is at the beginning of WHERE clause
          const whereIndex = query.indexOf("where");
          const afterWhere = query.substring(whereIndex + 5).trim();

          // Check if first condition is deleted = false
          const hasDeletedFirst =
            afterWhere.startsWith("deleted = false") ||
            afterWhere.startsWith("deleted=false") ||
            afterWhere.startsWith("e.deleted = false") ||
            afterWhere.startsWith("e.deleted=false") ||
            afterWhere.match(/^\w+\.deleted\s*=\s*false/);

          // Check if deleted check exists somewhere
          const hasDeletedCheck =
            query.includes("deleted = false") ||
            query.includes("deleted=false");

          if (!hasDeletedCheck) {
            violations.push(
              this.createViolation({
                file: file.file.relativePath,
                line: i + 1,
                column: match.index + 1,
                message: "Query missing deleted = false check",
                suggestion:
                  "Add deleted = false at the beginning of WHERE clause",
                codeSnippet: line.trim(),
              }),
            );
          } else if (!hasDeletedFirst) {
            violations.push(
              this.createViolation({
                file: file.file.relativePath,
                line: i + 1,
                column: match.index + 1,
                message:
                  "deleted = false check is not at the beginning of WHERE clause",
                suggestion:
                  "Move deleted = false to the beginning of WHERE clause",
                codeSnippet: line.trim(),
              }),
            );
          }
        }
      }

      // Reset regex lastIndex
      queryAnnotationPattern.lastIndex = 0;
    }

    return violations;
  }
}

/**
 * BE-REPO-002: Spring Data JPA naming
 * Verify Spring Data JPA conventions (findBy..., existsBy..., countBy...)
 */
export class SpringDataJpaNamingRule extends BaseRule {
  id = "BE-REPO-002";
  name = "Spring Data JPA naming";
  category = "repository" as const;
  severity = "warning" as const;
  description =
    "Use Spring Data JPA naming conventions: findBy..., existsBy..., countBy...";
  projectType = "backend" as const;
  canAutoFix = false;

  check(file: ParsedJavaFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Only check Repository
    if (!file.file.isRepository) return violations;

    // Valid Spring Data JPA prefixes
    const validPrefixes = [
      "findBy",
      "findAllBy",
      "findFirstBy",
      "findTopBy",
      "existsBy",
      "countBy",
      "deleteBy",
      "removeBy",
      "readBy",
      "queryBy",
      "getBy",
      "streamBy",
    ];

    for (const method of file.methods) {
      // Skip methods with @Query annotation
      const hasQueryAnnotation = method.annotations.some(
        (ann) => ann.name === "Query",
      );
      if (hasQueryAnnotation) continue;

      // Skip default JPA methods
      const defaultMethods = [
        "save",
        "saveAll",
        "findById",
        "findAll",
        "findAllById",
        "existsById",
        "count",
        "deleteById",
        "delete",
        "deleteAll",
        "deleteAllById",
        "flush",
        "saveAndFlush",
        "saveAllAndFlush",
        "deleteAllInBatch",
        "deleteAllByIdInBatch",
        "getReferenceById",
        "getById",
      ];
      if (defaultMethods.includes(method.name)) continue;

      // Check if method name follows convention
      const followsConvention = validPrefixes.some((prefix) =>
        method.name.startsWith(prefix),
      );

      if (!followsConvention && method.modifier === "public") {
        violations.push(
          this.createViolation({
            file: file.file.relativePath,
            line: method.line,
            message: `Repository method ${method.name} does not follow Spring Data JPA naming convention`,
            suggestion: `Rename method to follow convention: findBy..., existsBy..., countBy..., or use @Query annotation`,
            codeSnippet: `${method.returnType} ${method.name}(...)`,
          }),
        );
      }
    }

    return violations;
  }
}
