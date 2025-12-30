/**
 * Tests cho Scanner module
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  discoverFiles,
  parseTypeScriptFile,
  parseJavaFile,
  defaultFrontendOptions,
  defaultBackendOptions,
} from "../scanner";
import type { FileInfo } from "../types";

// Test fixtures directory
const fixturesDir = path.join(__dirname, "fixtures");

describe("Scanner Module", () => {
  // Setup test fixtures
  beforeAll(() => {
    // Tạo thư mục fixtures
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }

    // Tạo file TypeScript test
    fs.writeFileSync(
      path.join(fixturesDir, "test-component.tsx"),
      `'use client'

import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';

// Component chính
export default function TestComponent() {
  const { user } = useAuth();
  
  return (
    <div>
      <Button>Click me</Button>
    </div>
  );
}

export const helper = () => {};
`,
    );

    // Tạo file page.tsx
    fs.writeFileSync(
      path.join(fixturesDir, "page.tsx"),
      `import { TestComponent } from './_test-component';

export default function Page() {
  return <TestComponent />;
}
`,
    );

    // Tạo file Java test
    fs.writeFileSync(
      path.join(fixturesDir, "TestService.java"),
      `package com.tamabee.api_hr.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service xử lý test
 */
@Service
public class TestServiceImpl implements ITestService {
    
    private final TestRepository testRepository;
    
    @Transactional
    public void createTest(String name) {
        // Tạo test mới
    }
    
    @Transactional(readOnly = true)
    public Test getTest(Long id) {
        return testRepository.findById(id);
    }
}
`,
    );
  });

  // Cleanup
  afterAll(() => {
    if (fs.existsSync(fixturesDir)) {
      fs.rmSync(fixturesDir, { recursive: true });
    }
  });

  describe("discoverFiles", () => {
    it("should discover TypeScript files", async () => {
      const files = await discoverFiles(fixturesDir, {
        ...defaultFrontendOptions,
        include: [],
      });

      expect(files.length).toBeGreaterThan(0);
      expect(files.some((f) => f.type === "tsx")).toBe(true);
    });

    it("should identify page files correctly", async () => {
      const files = await discoverFiles(fixturesDir, {
        ...defaultFrontendOptions,
        include: [],
      });

      const pageFile = files.find((f) => f.relativePath.includes("page.tsx"));
      expect(pageFile).toBeDefined();
      expect(pageFile?.isPage).toBe(true);
    });

    it("should identify component files correctly", async () => {
      const files = await discoverFiles(fixturesDir, {
        ...defaultFrontendOptions,
        include: [],
      });

      const componentFile = files.find((f) =>
        f.relativePath.includes("test-component.tsx"),
      );
      expect(componentFile).toBeDefined();
      expect(componentFile?.isComponent).toBe(true);
    });

    it("should discover Java files with backend options", async () => {
      const files = await discoverFiles(fixturesDir, {
        ...defaultBackendOptions,
        include: [],
      });

      expect(files.some((f) => f.type === "java")).toBe(true);
    });

    it("should identify service files correctly", async () => {
      const files = await discoverFiles(fixturesDir, {
        ...defaultBackendOptions,
        include: [],
      });

      const serviceFile = files.find((f) =>
        f.relativePath.includes("TestService.java"),
      );
      expect(serviceFile).toBeDefined();
      expect(serviceFile?.isService).toBe(true);
    });
  });

  describe("parseTypeScriptFile", () => {
    it("should parse imports correctly", async () => {
      const fileInfo: FileInfo = {
        path: path.join(fixturesDir, "test-component.tsx"),
        relativePath: "test-component.tsx",
        type: "tsx",
        isPage: false,
        isComponent: true,
        isService: false,
        isController: false,
        isMapper: false,
        isEntity: false,
        isRepository: false,
      };

      const parsed = await parseTypeScriptFile(fileInfo);

      expect(parsed.imports.length).toBe(3);
      expect(parsed.imports[0].source).toBe("react");
      expect(parsed.imports[1].source).toBe("@/components/ui/button");
      expect(parsed.imports[1].namedImports).toContain("Button");
    });

    it("should detect use client directive", async () => {
      const fileInfo: FileInfo = {
        path: path.join(fixturesDir, "test-component.tsx"),
        relativePath: "test-component.tsx",
        type: "tsx",
        isPage: false,
        isComponent: true,
        isService: false,
        isController: false,
        isMapper: false,
        isEntity: false,
        isRepository: false,
      };

      const parsed = await parseTypeScriptFile(fileInfo);

      expect(parsed.hasUseClient).toBe(true);
      expect(parsed.hasUseServer).toBe(false);
    });

    it("should parse exports correctly", async () => {
      const fileInfo: FileInfo = {
        path: path.join(fixturesDir, "test-component.tsx"),
        relativePath: "test-component.tsx",
        type: "tsx",
        isPage: false,
        isComponent: true,
        isService: false,
        isController: false,
        isMapper: false,
        isEntity: false,
        isRepository: false,
      };

      const parsed = await parseTypeScriptFile(fileInfo);

      expect(parsed.exports.length).toBe(2);
      expect(parsed.exports.some((e) => e.isDefault)).toBe(true);
      expect(parsed.exports.some((e) => e.name === "helper")).toBe(true);
    });

    it("should parse comments correctly", async () => {
      const fileInfo: FileInfo = {
        path: path.join(fixturesDir, "test-component.tsx"),
        relativePath: "test-component.tsx",
        type: "tsx",
        isPage: false,
        isComponent: true,
        isService: false,
        isController: false,
        isMapper: false,
        isEntity: false,
        isRepository: false,
      };

      const parsed = await parseTypeScriptFile(fileInfo);

      expect(parsed.comments.length).toBeGreaterThan(0);
      expect(parsed.comments.some((c) => c.content.includes("Component"))).toBe(
        true,
      );
    });
  });

  describe("parseJavaFile", () => {
    it("should parse class name and package", async () => {
      const fileInfo: FileInfo = {
        path: path.join(fixturesDir, "TestService.java"),
        relativePath: "TestService.java",
        type: "java",
        isPage: false,
        isComponent: false,
        isService: true,
        isController: false,
        isMapper: false,
        isEntity: false,
        isRepository: false,
      };

      const parsed = await parseJavaFile(fileInfo);

      expect(parsed.className).toBe("TestServiceImpl");
      expect(parsed.packageName).toBe("com.tamabee.api_hr.service");
    });

    it("should parse class annotations", async () => {
      const fileInfo: FileInfo = {
        path: path.join(fixturesDir, "TestService.java"),
        relativePath: "TestService.java",
        type: "java",
        isPage: false,
        isComponent: false,
        isService: true,
        isController: false,
        isMapper: false,
        isEntity: false,
        isRepository: false,
      };

      const parsed = await parseJavaFile(fileInfo);

      expect(parsed.classAnnotations.some((a) => a.name === "Service")).toBe(
        true,
      );
    });

    it("should parse methods with annotations", async () => {
      const fileInfo: FileInfo = {
        path: path.join(fixturesDir, "TestService.java"),
        relativePath: "TestService.java",
        type: "java",
        isPage: false,
        isComponent: false,
        isService: true,
        isController: false,
        isMapper: false,
        isEntity: false,
        isRepository: false,
      };

      const parsed = await parseJavaFile(fileInfo);

      expect(parsed.methods.length).toBe(2);

      const createMethod = parsed.methods.find((m) => m.name === "createTest");
      expect(createMethod).toBeDefined();
      expect(
        createMethod?.annotations.some((a) => a.name === "Transactional"),
      ).toBe(true);

      const getMethod = parsed.methods.find((m) => m.name === "getTest");
      expect(getMethod).toBeDefined();
      const transactionalAnnotation = getMethod?.annotations.find(
        (a) => a.name === "Transactional",
      );
      expect(transactionalAnnotation?.parameters["readOnly"]).toBe("true");
    });

    it("should parse implements interfaces", async () => {
      const fileInfo: FileInfo = {
        path: path.join(fixturesDir, "TestService.java"),
        relativePath: "TestService.java",
        type: "java",
        isPage: false,
        isComponent: false,
        isService: true,
        isController: false,
        isMapper: false,
        isEntity: false,
        isRepository: false,
      };

      const parsed = await parseJavaFile(fileInfo);

      expect(parsed.implementsInterfaces).toContain("ITestService");
    });
  });
});
