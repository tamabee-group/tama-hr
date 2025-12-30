/**
 * Security Rules (BE-SEC-001, BE-SEC-002, BE-SEC-003)
 * Check security annotations compliance with rules
 */

import { BaseRule } from "../../interfaces/rule";
import type { ParsedJavaFile, RuleContext, Violation } from "../../types";

/**
 * BE-SEC-001: @PreAuthorize required
 * Verify @PreAuthorize annotation exists for Controller methods (except public endpoints)
 */
export class PreAuthorizeRequiredRule extends BaseRule {
  id = "BE-SEC-001";
  name = "@PreAuthorize required";
  category = "security" as const;
  severity = "error" as const;
  description =
    "Controller methods MUST have @PreAuthorize annotation (except public endpoints)";
  projectType = "backend" as const;
  canAutoFix = false;

  check(file: ParsedJavaFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Only check Controller
    if (!file.file.isController) return violations;

    // Check if it's a public endpoint (auth controller)
    const isAuthController =
      file.packageName.includes(".core.") ||
      file.className.toLowerCase().includes("auth") ||
      file.className.toLowerCase().includes("public");

    if (isAuthController) return violations;

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

      // Check if has @PreAuthorize
      const hasPreAuthorize = method.annotations.some(
        (ann) => ann.name === "PreAuthorize",
      );

      if (!hasPreAuthorize) {
        violations.push(
          this.createViolation({
            file: file.file.relativePath,
            line: method.line,
            message: `Controller method ${method.name} missing @PreAuthorize annotation`,
            suggestion:
              "Add @PreAuthorize annotation to check access permissions",
            codeSnippet: `${method.returnType} ${method.name}(...)`,
          }),
        );
      }
    }

    return violations;
  }
}

/**
 * BE-SEC-002: Admin package roles
 * Verify admin package APIs only allow ADMIN_TAMABEE role
 */
export class AdminPackageRolesRule extends BaseRule {
  id = "BE-SEC-002";
  name = "Admin package roles";
  category = "security" as const;
  severity = "error" as const;
  description = "Admin package APIs only allow ADMIN_TAMABEE role";
  projectType = "backend" as const;
  canAutoFix = false;

  check(file: ParsedJavaFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Only check Controller in admin package
    if (!file.file.isController) return violations;
    if (!file.packageName.includes(".admin.")) return violations;

    for (const method of file.methods) {
      // Find @PreAuthorize annotation
      const preAuthorize = method.annotations.find(
        (ann) => ann.name === "PreAuthorize",
      );

      if (!preAuthorize) continue;

      // Check if value contains ADMIN_TAMABEE
      const value = preAuthorize.parameters["value"] || "";
      const hasAdminTamabee = value.includes("ADMIN_TAMABEE");

      // Check if has invalid role
      const invalidRoles = [
        "ADMIN_COMPANY",
        "MANAGER_COMPANY",
        "EMPLOYEE_COMPANY",
      ];
      const hasInvalidRole = invalidRoles.some((role) => value.includes(role));

      if (!hasAdminTamabee || hasInvalidRole) {
        violations.push(
          this.createViolation({
            file: file.file.relativePath,
            line: method.line,
            message: `Admin API ${method.name} has invalid role`,
            suggestion: "Admin package APIs only allow ADMIN_TAMABEE role",
            codeSnippet: `@PreAuthorize(${value})`,
          }),
        );
      }
    }

    return violations;
  }
}

/**
 * BE-SEC-003: Company package roles
 * Verify company package APIs allow ADMIN_COMPANY or MANAGER_COMPANY roles
 */
export class CompanyPackageRolesRule extends BaseRule {
  id = "BE-SEC-003";
  name = "Company package roles";
  category = "security" as const;
  severity = "error" as const;
  description =
    "Company package APIs allow ADMIN_COMPANY or MANAGER_COMPANY roles";
  projectType = "backend" as const;
  canAutoFix = false;

  check(file: ParsedJavaFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Only check Controller in company package
    if (!file.file.isController) return violations;
    if (!file.packageName.includes(".company.")) return violations;

    for (const method of file.methods) {
      // Find @PreAuthorize annotation
      const preAuthorize = method.annotations.find(
        (ann) => ann.name === "PreAuthorize",
      );

      if (!preAuthorize) continue;

      // Check if value contains ADMIN_COMPANY or MANAGER_COMPANY
      const value = preAuthorize.parameters["value"] || "";
      const hasValidRole =
        value.includes("ADMIN_COMPANY") || value.includes("MANAGER_COMPANY");

      // Check if has ADMIN_TAMABEE (should not be in company package)
      const hasTamabeeRole = value.includes("TAMABEE");

      if (!hasValidRole) {
        violations.push(
          this.createViolation({
            file: file.file.relativePath,
            line: method.line,
            message: `Company API ${method.name} missing ADMIN_COMPANY or MANAGER_COMPANY role`,
            suggestion:
              "Company package APIs must allow ADMIN_COMPANY or MANAGER_COMPANY roles",
            codeSnippet: `@PreAuthorize(${value})`,
          }),
        );
      }

      if (hasTamabeeRole) {
        violations.push(
          this.createViolation({
            file: file.file.relativePath,
            line: method.line,
            message: `Company API ${method.name} has invalid TAMABEE role`,
            suggestion: "Company package APIs should not have TAMABEE roles",
            codeSnippet: `@PreAuthorize(${value})`,
          }),
        );
      }
    }

    return violations;
  }
}
