/**
 * Tests cho Rule Registry
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ruleRegistry } from "../rules/rule-registry";
import { BaseRule } from "../interfaces/rule";
import type {
  ParsedFile,
  RuleCategory,
  RuleContext,
  Severity,
  Violation,
  ProjectType,
} from "../types";

// Mock rule cho testing
class MockFrontendRule extends BaseRule {
  id = "FE-TEST-001";
  name = "Test Frontend Rule";
  category: RuleCategory = "navigation";
  severity: Severity = "error";
  description = "Test rule for frontend";
  projectType: ProjectType = "frontend";
  canAutoFix = false;

  check(): Violation[] {
    return [];
  }
}

class MockBackendRule extends BaseRule {
  id = "BE-TEST-001";
  name = "Test Backend Rule";
  category: RuleCategory = "architecture";
  severity: Severity = "warning";
  description = "Test rule for backend";
  projectType: ProjectType = "backend";
  canAutoFix = true;

  check(): Violation[] {
    return [];
  }
}

class MockBothRule extends BaseRule {
  id = "CM-TEST-001";
  name = "Test Common Rule";
  category: RuleCategory = "comments";
  severity: Severity = "info";
  description = "Test rule for both";
  projectType: ProjectType = "both";
  canAutoFix = true;

  check(): Violation[] {
    return [];
  }
}

describe("Rule Registry", () => {
  beforeEach(() => {
    ruleRegistry.clear();
  });

  describe("register", () => {
    it("should register a rule", () => {
      const rule = new MockFrontendRule();
      ruleRegistry.register(rule);

      expect(ruleRegistry.size).toBe(1);
      expect(ruleRegistry.get("FE-TEST-001")).toBe(rule);
    });

    it("should overwrite existing rule with same id", () => {
      const rule1 = new MockFrontendRule();
      const rule2 = new MockFrontendRule();
      rule2.name = "Updated Rule";

      ruleRegistry.register(rule1);
      ruleRegistry.register(rule2);

      expect(ruleRegistry.size).toBe(1);
      expect(ruleRegistry.get("FE-TEST-001")?.name).toBe("Updated Rule");
    });
  });

  describe("registerAll", () => {
    it("should register multiple rules", () => {
      const rules = [
        new MockFrontendRule(),
        new MockBackendRule(),
        new MockBothRule(),
      ];

      ruleRegistry.registerAll(rules);

      expect(ruleRegistry.size).toBe(3);
    });
  });

  describe("getAll", () => {
    it("should return all registered rules", () => {
      ruleRegistry.register(new MockFrontendRule());
      ruleRegistry.register(new MockBackendRule());

      const all = ruleRegistry.getAll();

      expect(all.length).toBe(2);
    });
  });

  describe("getByProjectType", () => {
    it("should return frontend rules", () => {
      ruleRegistry.register(new MockFrontendRule());
      ruleRegistry.register(new MockBackendRule());
      ruleRegistry.register(new MockBothRule());

      const frontendRules = ruleRegistry.getByProjectType("frontend");

      expect(frontendRules.length).toBe(2); // frontend + both
      expect(frontendRules.some((r) => r.id === "FE-TEST-001")).toBe(true);
      expect(frontendRules.some((r) => r.id === "CM-TEST-001")).toBe(true);
    });

    it("should return backend rules", () => {
      ruleRegistry.register(new MockFrontendRule());
      ruleRegistry.register(new MockBackendRule());
      ruleRegistry.register(new MockBothRule());

      const backendRules = ruleRegistry.getByProjectType("backend");

      expect(backendRules.length).toBe(2); // backend + both
      expect(backendRules.some((r) => r.id === "BE-TEST-001")).toBe(true);
      expect(backendRules.some((r) => r.id === "CM-TEST-001")).toBe(true);
    });
  });

  describe("getByCategory", () => {
    it("should return rules by category", () => {
      ruleRegistry.register(new MockFrontendRule());
      ruleRegistry.register(new MockBackendRule());

      const navigationRules = ruleRegistry.getByCategory("navigation");

      expect(navigationRules.length).toBe(1);
      expect(navigationRules[0].id).toBe("FE-TEST-001");
    });
  });

  describe("getAutoFixable", () => {
    it("should return only auto-fixable rules", () => {
      ruleRegistry.register(new MockFrontendRule()); // canAutoFix = false
      ruleRegistry.register(new MockBackendRule()); // canAutoFix = true
      ruleRegistry.register(new MockBothRule()); // canAutoFix = true

      const autoFixable = ruleRegistry.getAutoFixable();

      expect(autoFixable.length).toBe(2);
      expect(autoFixable.every((r) => r.canAutoFix)).toBe(true);
    });
  });

  describe("clear", () => {
    it("should remove all rules", () => {
      ruleRegistry.register(new MockFrontendRule());
      ruleRegistry.register(new MockBackendRule());

      expect(ruleRegistry.size).toBe(2);

      ruleRegistry.clear();

      expect(ruleRegistry.size).toBe(0);
    });
  });
});

describe("BaseRule", () => {
  it("should create violation with correct properties", () => {
    const rule = new MockFrontendRule();

    // Access protected method through type assertion
    const violation = (
      rule as unknown as { createViolation: (params: unknown) => Violation }
    ).createViolation({
      file: "test.tsx",
      line: 10,
      column: 5,
      message: "Test violation",
      suggestion: "Fix it",
      codeSnippet: "const x = 1;",
    });

    expect(violation.ruleId).toBe("FE-TEST-001");
    expect(violation.ruleName).toBe("Test Frontend Rule");
    expect(violation.category).toBe("navigation");
    expect(violation.severity).toBe("error");
    expect(violation.projectType).toBe("frontend");
    expect(violation.file).toBe("test.tsx");
    expect(violation.line).toBe(10);
    expect(violation.column).toBe(5);
    expect(violation.message).toBe("Test violation");
    expect(violation.suggestion).toBe("Fix it");
    expect(violation.canAutoFix).toBe(false);
  });
});
