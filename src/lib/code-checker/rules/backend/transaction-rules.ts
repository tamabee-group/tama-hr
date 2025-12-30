/**
 * Transaction Rules (BE-TXN-001, BE-TXN-002)
 * Check transaction annotations compliance with rules
 */

import { BaseRule } from "../../interfaces/rule";
import type { ParsedJavaFile, RuleContext, Violation } from "../../types";

/**
 * BE-TXN-001: @Transactional for write operations
 * Verify @Transactional annotation exists for write operations (create, update, delete)
 */
export class TransactionalWriteRule extends BaseRule {
  id = "BE-TXN-001";
  name = "@Transactional for write ops";
  category = "transaction" as const;
  severity = "warning" as const;
  description =
    "Write operations (create, update, delete) MUST have @Transactional annotation";
  projectType = "backend" as const;
  canAutoFix = true;

  check(file: ParsedJavaFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Only check Service
    if (!file.file.isService) return violations;

    // Patterns for write operations
    const writeMethodPatterns = [
      /^create/i,
      /^save/i,
      /^add/i,
      /^insert/i,
      /^update/i,
      /^modify/i,
      /^edit/i,
      /^delete/i,
      /^remove/i,
      /^soft[Dd]elete/i,
    ];

    for (const method of file.methods) {
      // Check if it's a write method
      const isWriteMethod = writeMethodPatterns.some((pattern) =>
        pattern.test(method.name),
      );

      if (!isWriteMethod) continue;

      // Check if has @Transactional
      const hasTransactional = method.annotations.some(
        (ann) => ann.name === "Transactional",
      );

      if (!hasTransactional) {
        violations.push(
          this.createViolation({
            file: file.file.relativePath,
            line: method.line,
            message: `Write method ${method.name} missing @Transactional annotation`,
            suggestion:
              "Add @Transactional annotation to ensure data integrity",
            codeSnippet: `${method.returnType} ${method.name}(...)`,
            fixCode: "@Transactional",
          }),
        );
      } else {
        // Check if has readOnly = true for write operations
        const transactionalAnn = method.annotations.find(
          (ann) => ann.name === "Transactional",
        );
        if (transactionalAnn?.parameters["readOnly"] === "true") {
          violations.push(
            this.createViolation({
              file: file.file.relativePath,
              line: method.line,
              message: `Write method ${method.name} has @Transactional(readOnly = true)`,
              suggestion: "Remove readOnly = true for write operations",
              codeSnippet: `@Transactional(readOnly = true)`,
            }),
          );
        }
      }
    }

    return violations;
  }
}

/**
 * BE-TXN-002: @Transactional(readOnly = true) for read operations
 * Verify @Transactional(readOnly = true) annotation exists for read operations
 */
export class TransactionalReadRule extends BaseRule {
  id = "BE-TXN-002";
  name = "@Transactional(readOnly) for read ops";
  category = "transaction" as const;
  severity = "warning" as const;
  description =
    "Read operations MUST have @Transactional(readOnly = true) annotation";
  projectType = "backend" as const;
  canAutoFix = true;

  check(file: ParsedJavaFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Only check Service
    if (!file.file.isService) return violations;

    // Patterns for read operations
    const readMethodPatterns = [
      /^get/i,
      /^find/i,
      /^fetch/i,
      /^load/i,
      /^search/i,
      /^list/i,
      /^count/i,
      /^exists/i,
      /^is[A-Z]/,
      /^has[A-Z]/,
    ];

    // Patterns for write operations (to exclude)
    const writeMethodPatterns = [
      /^create/i,
      /^save/i,
      /^add/i,
      /^insert/i,
      /^update/i,
      /^modify/i,
      /^edit/i,
      /^delete/i,
      /^remove/i,
      /^soft[Dd]elete/i,
    ];

    for (const method of file.methods) {
      // Check if it's a read method
      const isReadMethod = readMethodPatterns.some((pattern) =>
        pattern.test(method.name),
      );

      // Exclude write methods
      const isWriteMethod = writeMethodPatterns.some((pattern) =>
        pattern.test(method.name),
      );

      if (!isReadMethod || isWriteMethod) continue;

      // Check if has @Transactional
      const transactionalAnn = method.annotations.find(
        (ann) => ann.name === "Transactional",
      );

      if (!transactionalAnn) {
        violations.push(
          this.createViolation({
            file: file.file.relativePath,
            line: method.line,
            message: `Read method ${method.name} missing @Transactional(readOnly = true) annotation`,
            suggestion:
              "Add @Transactional(readOnly = true) to optimize performance",
            codeSnippet: `${method.returnType} ${method.name}(...)`,
            fixCode: "@Transactional(readOnly = true)",
          }),
        );
      } else if (transactionalAnn.parameters["readOnly"] !== "true") {
        violations.push(
          this.createViolation({
            file: file.file.relativePath,
            line: method.line,
            message: `Read method ${method.name} has @Transactional but missing readOnly = true`,
            suggestion: "Add readOnly = true to optimize performance",
            codeSnippet: `@Transactional`,
            fixCode: "@Transactional(readOnly = true)",
          }),
        );
      }
    }

    return violations;
  }
}
