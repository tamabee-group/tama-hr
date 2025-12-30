/**
 * Architecture Rules (BE-ARCH-001, BE-ARCH-002, BE-ARCH-003)
 * Check code compliance with layered architecture
 */

import { BaseRule } from "../../interfaces/rule";
import type { ParsedJavaFile, RuleContext, Violation } from "../../types";

/**
 * BE-ARCH-001: Service interface pattern
 * Verify Interface + Implementation pattern (I{Entity}Service + {Entity}ServiceImpl)
 */
export class ServiceInterfacePatternRule extends BaseRule {
  id = "BE-ARCH-001";
  name = "Service interface pattern";
  category = "architecture" as const;
  severity = "error" as const;
  description =
    "Service MUST follow Interface + Implementation pattern: I{Entity}Service + {Entity}ServiceImpl";
  projectType = "backend" as const;
  canAutoFix = false;

  check(file: ParsedJavaFile, context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Only check Service files
    if (!file.file.isService) return violations;

    const className = file.className;

    // Check if it's a ServiceImpl
    if (className.endsWith("ServiceImpl")) {
      // Must implement interface I{Entity}Service
      const expectedInterface = "I" + className.replace("Impl", "");
      const hasInterface = file.implementsInterfaces.some(
        (iface) => iface === expectedInterface,
      );

      if (!hasInterface) {
        violations.push(
          this.createViolation({
            file: file.file.relativePath,
            line: 1,
            message: `Service class ${className} does not implement interface ${expectedInterface}`,
            suggestion: `Create interface ${expectedInterface} and implement it in ${className}`,
            codeSnippet: `class ${className}`,
          }),
        );
      }
    } else if (className.endsWith("Service") && !className.startsWith("I")) {
      // Service class is not Impl and not Interface
      // Check if it's an interface
      const isInterface = file.content.includes(`interface ${className}`);

      if (!isInterface) {
        violations.push(
          this.createViolation({
            file: file.file.relativePath,
            line: 1,
            message: `Service class ${className} does not follow naming convention`,
            suggestion: `Rename to ${className}Impl and create interface I${className}`,
            codeSnippet: `class ${className}`,
          }),
        );
      }
    }

    return violations;
  }
}

/**
 * BE-ARCH-002: Mapper @Component annotation
 * Verify Mapper classes have @Component annotation
 */
export class MapperComponentAnnotationRule extends BaseRule {
  id = "BE-ARCH-002";
  name = "Mapper @Component annotation";
  category = "architecture" as const;
  severity = "error" as const;
  description = "Mapper class MUST have @Component annotation";
  projectType = "backend" as const;
  canAutoFix = true;

  check(file: ParsedJavaFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Only check Mapper files
    if (!file.file.isMapper) return violations;

    const hasComponentAnnotation = file.classAnnotations.some(
      (ann) => ann.name === "Component",
    );

    if (!hasComponentAnnotation) {
      // Find class declaration line
      let classLine = 1;
      for (let i = 0; i < file.lines.length; i++) {
        if (file.lines[i].includes(`class ${file.className}`)) {
          classLine = i + 1;
          break;
        }
      }

      violations.push(
        this.createViolation({
          file: file.file.relativePath,
          line: classLine,
          message: `Mapper class ${file.className} missing @Component annotation`,
          suggestion: "Add @Component annotation before class declaration",
          codeSnippet: `class ${file.className}`,
          fixCode: "@Component",
        }),
      );
    }

    return violations;
  }
}

/**
 * BE-ARCH-003: Domain-based package structure
 * Verify domain-based organization (admin/, company/, core/)
 */
export class DomainBasedPackageRule extends BaseRule {
  id = "BE-ARCH-003";
  name = "Domain-based package structure";
  category = "architecture" as const;
  severity = "warning" as const;
  description = "Package structure MUST follow domain: admin/, company/, core/";
  projectType = "backend" as const;
  canAutoFix = false;

  check(file: ParsedJavaFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    const packageName = file.packageName;
    const validDomains = [
      "admin",
      "company",
      "core",
      "mapper",
      "entity",
      "repository",
      "dto",
      "enums",
      "exception",
      "config",
      "util",
    ];

    // Check if package contains valid domain
    const hasDomain = validDomains.some(
      (domain) =>
        packageName.includes(`.${domain}`) ||
        packageName.endsWith(`.${domain}`),
    );

    // Only warn for service/controller packages
    if (!hasDomain && (file.file.isService || file.file.isController)) {
      violations.push(
        this.createViolation({
          file: file.file.relativePath,
          line: 1,
          message: `Package ${packageName} does not follow domain-based structure`,
          suggestion: "Organize package by domain: admin/, company/, core/",
          codeSnippet: `package ${packageName};`,
        }),
      );
    }

    return violations;
  }
}
