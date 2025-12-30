/**
 * Frontend Rules Tests
 * Test các frontend rules hoạt động đúng
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ruleRegistry } from "../rules/rule-registry";
import { registerFrontendRules } from "../rules/frontend";
import type { ParsedFile, FileInfo, RuleContext, ImportGraph } from "../types";

// Helper để tạo mock ParsedFile
function createMockFile(
  content: string,
  options: Partial<FileInfo> = {},
): ParsedFile {
  const lines = content.split("\n");
  const hasUseClient = lines.some(
    (l) => l.trim() === "'use client'" || l.trim() === '"use client"',
  );
  const hasUseServer = lines.some(
    (l) => l.trim() === "'use server'" || l.trim() === '"use server"',
  );

  return {
    file: {
      path: options.path || "/test/file.tsx",
      relativePath: options.relativePath || "test/file.tsx",
      type: options.type || "tsx",
      isPage: options.isPage || false,
      isComponent: options.isComponent || true,
      isService: false,
      isController: false,
      isMapper: false,
      isEntity: false,
      isRepository: false,
    },
    lines,
    lineCount: lines.length,
    imports: [],
    exports: [],
    comments: [],
    hasUseClient,
    hasUseServer,
    content,
  };
}

// Helper để tạo mock RuleContext
function createMockContext(): RuleContext {
  const importGraph: ImportGraph = {
    importedBy: new Map(),
    imports: new Map(),
  };

  return {
    projectRoot: "/test",
    allFiles: [],
    importGraph,
  };
}

describe("Frontend Rules", () => {
  beforeEach(() => {
    ruleRegistry.clear();
    registerFrontendRules();
  });

  describe("Navigation Rules", () => {
    it("FE-NAV-001: should detect window.location.href", () => {
      const rule = ruleRegistry.get("FE-NAV-001");
      expect(rule).toBeDefined();

      const file = createMockFile(`
        function navigate() {
          window.location.href = '/dashboard';
        }
      `);

      const violations = rule!.check(file, createMockContext());
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].message).toContain("window.location.href");
    });

    it("FE-NAV-002: should detect <a href> for internal links", () => {
      const rule = ruleRegistry.get("FE-NAV-002");
      expect(rule).toBeDefined();

      const file = createMockFile(`
        function Component() {
          return <a href="/dashboard">Dashboard</a>;
        }
      `);

      const violations = rule!.check(file, createMockContext());
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].suggestion).toContain("Link");
    });

    it("FE-NAV-002: should not flag external links", () => {
      const rule = ruleRegistry.get("FE-NAV-002");
      const file = createMockFile(`
        function Component() {
          return <a href="https://google.com">Google</a>;
        }
      `);

      const violations = rule!.check(file, createMockContext());
      expect(violations.length).toBe(0);
    });
  });

  describe("Component Rules", () => {
    it("FE-COMP-001: should detect component exceeding 250 lines", () => {
      const rule = ruleRegistry.get("FE-COMP-001");
      expect(rule).toBeDefined();

      // Tạo file với 300 dòng
      const lines = Array(300).fill("// line").join("\n");
      const file = createMockFile(lines, { isComponent: true });

      const violations = rule!.check(file, createMockContext());
      expect(violations.length).toBe(1);
      expect(violations[0].message).toContain("300");
    });

    it("FE-COMP-002: should detect use client in page.tsx", () => {
      const rule = ruleRegistry.get("FE-COMP-002");
      expect(rule).toBeDefined();

      const file = createMockFile(
        `'use client'
        export default function Page() {
          return <div>Page</div>;
        }`,
        { isPage: true, relativePath: "app/dashboard/page.tsx" },
      );

      const violations = rule!.check(file, createMockContext());
      expect(violations.length).toBe(1);
      expect(violations[0].severity).toBe("error");
    });
  });

  describe("Type Rules", () => {
    it("FE-TYPE-001: should detect any type usage", () => {
      const rule = ruleRegistry.get("FE-TYPE-001");
      expect(rule).toBeDefined();

      const file = createMockFile(`
        function process(data: any) {
          return data;
        }
      `);

      const violations = rule!.check(file, createMockContext());
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].message).toContain("any");
    });

    it('FE-TYPE-001: should not flag "company" or "many"', () => {
      const rule = ruleRegistry.get("FE-TYPE-001");
      const file = createMockFile(`
        const company = getCompany();
        const many = getManyItems();
      `);

      const violations = rule!.check(file, createMockContext());
      expect(violations.length).toBe(0);
    });
  });

  describe("Comment Rules", () => {
    it("FE-CMT-001: should detect requirement comments", () => {
      const rule = ruleRegistry.get("FE-CMT-001");
      expect(rule).toBeDefined();

      const file = createMockFile(`
        // Requirements: 1.1, 1.2
        function doSomething() {}
        
        // Validates: Requirements 2.1
        function doAnother() {}
      `);

      const violations = rule!.check(file, createMockContext());
      expect(violations.length).toBe(2);
    });
  });

  describe("Performance Rules", () => {
    it("FE-PERF-001: should detect <img> tags", () => {
      const rule = ruleRegistry.get("FE-PERF-001");
      expect(rule).toBeDefined();

      const file = createMockFile(`
        function Component() {
          return <img src="/image.png" alt="test" />;
        }
      `);

      const violations = rule!.check(file, createMockContext());
      expect(violations.length).toBe(1);
      expect(violations[0].suggestion).toContain("next/image");
    });
  });

  describe("Rule Registration", () => {
    it("should register all frontend rules", () => {
      const frontendRules = ruleRegistry.getByProjectType("frontend");
      expect(frontendRules.length).toBeGreaterThan(0);

      // Kiểm tra một số rules quan trọng
      expect(ruleRegistry.get("FE-NAV-001")).toBeDefined();
      expect(ruleRegistry.get("FE-NAV-002")).toBeDefined();
      expect(ruleRegistry.get("FE-API-001")).toBeDefined();
      expect(ruleRegistry.get("FE-COMP-001")).toBeDefined();
      expect(ruleRegistry.get("FE-TYPE-001")).toBeDefined();
      expect(ruleRegistry.get("FE-CMT-001")).toBeDefined();
    });

    it("should have correct categories", () => {
      const navRules = ruleRegistry.getByCategory("navigation");
      expect(navRules.length).toBe(2);

      const componentRules = ruleRegistry.getByCategory("components");
      expect(componentRules.length).toBe(3);
    });
  });
});
