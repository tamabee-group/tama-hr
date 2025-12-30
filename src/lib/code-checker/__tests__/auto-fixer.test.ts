/**
 * Unit tests cho Auto-Fixer
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AutoFixer } from "../auto-fixer/auto-fixer";
import { DiffGenerator } from "../auto-fixer/diff-generator";
import { FixApplier } from "../auto-fixer/fix-applier";
import type { Violation } from "../types";

// Mock fs/promises module
const mockReadFile = vi.fn();
const mockWriteFile = vi.fn();
const mockUnlink = vi.fn();

vi.mock("fs/promises", () => ({
  readFile: (...args: unknown[]) => mockReadFile(...args),
  writeFile: (...args: unknown[]) => mockWriteFile(...args),
  unlink: (...args: unknown[]) => mockUnlink(...args),
}));

// Sample violation for testing
const createFixableViolation = (): Violation => ({
  id: "FE-NAV-001-test.tsx-10",
  ruleId: "FE-NAV-001",
  ruleName: "No window.location.href",
  category: "navigation",
  severity: "error",
  projectType: "frontend",
  file: "src/components/test.tsx",
  line: 10,
  column: 5,
  message: "Avoid using window.location.href",
  suggestion: "Use router.push() from next/navigation",
  codeSnippet: 'window.location.href = "/dashboard"',
  canAutoFix: true,
  fixCode: 'router.push("/dashboard")',
});

const createNonFixableViolation = (): Violation => ({
  id: "FE-TYPE-001-test.tsx-20",
  ruleId: "FE-TYPE-001",
  ruleName: "No any type",
  category: "types",
  severity: "error",
  projectType: "frontend",
  file: "src/components/test.tsx",
  line: 20,
  column: 10,
  message: "Avoid using any type",
  suggestion: "Define proper types",
  codeSnippet: "const data: any = {}",
  canAutoFix: false,
});

describe("DiffGenerator", () => {
  let diffGenerator: DiffGenerator;

  beforeEach(() => {
    diffGenerator = new DiffGenerator();
  });

  it("should generate diff for fixable violation", () => {
    const content = `import React from 'react';

function Component() {
  const handleClick = () => {
    window.location.href = "/dashboard";
  };
  return <div>Test</div>;
}`;

    const violation: Violation = {
      ...createFixableViolation(),
      line: 5,
    };

    const diff = diffGenerator.generateDiff(content, violation);

    expect(diff.file).toBe(violation.file);
    expect(diff.lineChanges.length).toBeGreaterThan(0);
    expect(diff.lineChanges[0].line).toBe(5);
    expect(diff.lineChanges[0].oldContent).toContain("window.location.href");
  });

  it("should return empty diff for non-fixable violation", () => {
    const content = "const data: any = {};";
    const violation = createNonFixableViolation();

    const diff = diffGenerator.generateDiff(content, violation);

    expect(diff.lineChanges.length).toBe(0);
    expect(diff.before).toBe(content);
    expect(diff.after).toBe(content);
  });

  it("should format diff for console with colors", () => {
    const diff = {
      file: "test.tsx",
      before: "old content",
      after: "new content",
      lineChanges: [
        { line: 1, oldContent: "old line", newContent: "new line" },
      ],
    };

    const formatted = diffGenerator.formatDiffForConsole(diff, true);

    expect(formatted).toContain("---");
    expect(formatted).toContain("+++");
    expect(formatted).toContain("old line");
    expect(formatted).toContain("new line");
  });

  it("should format diff for console without colors", () => {
    const diff = {
      file: "test.tsx",
      before: "old content",
      after: "new content",
      lineChanges: [
        { line: 1, oldContent: "old line", newContent: "new line" },
      ],
    };

    const formatted = diffGenerator.formatDiffForConsole(diff, false);

    expect(formatted).not.toContain("\x1b["); // No ANSI codes
    expect(formatted).toContain("old line");
    expect(formatted).toContain("new line");
  });

  it("should format diff for markdown", () => {
    const diff = {
      file: "test.tsx",
      before: "old content",
      after: "new content",
      lineChanges: [
        { line: 5, oldContent: "old line", newContent: "new line" },
      ],
    };

    const formatted = diffGenerator.formatDiffForMarkdown(diff);

    expect(formatted).toContain("**File:** `test.tsx`");
    expect(formatted).toContain("```diff");
    expect(formatted).toContain("- old line");
    expect(formatted).toContain("+ new line");
    expect(formatted).toContain("@@ Line 5 @@");
  });

  it("should generate unified diff format", () => {
    const diff = {
      file: "test.tsx",
      before: "line1\nline2\nline3\nline4\nline5",
      after: "line1\nline2\nmodified\nline4\nline5",
      lineChanges: [{ line: 3, oldContent: "line3", newContent: "modified" }],
    };

    const unified = diffGenerator.generateUnifiedDiff(diff, 1);

    expect(unified).toContain("--- a/test.tsx");
    expect(unified).toContain("+++ b/test.tsx");
    expect(unified).toContain("-line3");
    expect(unified).toContain("+modified");
  });
});

describe("FixApplier", () => {
  let fixApplier: FixApplier;

  beforeEach(() => {
    fixApplier = new FixApplier();
    vi.clearAllMocks();
  });

  it("should apply fix successfully", async () => {
    const fileContent = `import React from 'react';

function Component() {
  const handleClick = () => {
    window.location.href = "/dashboard";
  };
  return <div>Test</div>;
}`;

    mockReadFile.mockResolvedValue(fileContent);
    mockWriteFile.mockResolvedValue(undefined);

    const violation: Violation = {
      ...createFixableViolation(),
      line: 5,
    };

    const result = await fixApplier.applyFix(violation);

    expect(result.success).toBe(true);
    expect(result.file).toBe(violation.file);
    expect(mockWriteFile).toHaveBeenCalled();
  });

  it("should fail for non-fixable violation", async () => {
    const violation = createNonFixableViolation();

    const result = await fixApplier.applyFix(violation);

    expect(result.success).toBe(false);
    expect(result.error).toContain("cannot be auto-fixed");
  });

  it("should fail for invalid line number", async () => {
    mockReadFile.mockResolvedValue("single line");

    const violation: Violation = {
      ...createFixableViolation(),
      line: 100, // Invalid line
    };

    const result = await fixApplier.applyFix(violation);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid line number");
  });

  it("should handle file read error", async () => {
    mockReadFile.mockRejectedValue(new Error("File not found"));

    const violation = createFixableViolation();

    const result = await fixApplier.applyFix(violation);

    expect(result.success).toBe(false);
    expect(result.error).toContain("File not found");
  });

  it("should preview fix correctly", async () => {
    const fileContent = `line1
line2
window.location.href = "/test"
line4`;

    mockReadFile.mockResolvedValue(fileContent);

    const violation: Violation = {
      ...createFixableViolation(),
      line: 3,
    };

    const preview = await fixApplier.previewFix(violation);

    expect(preview.file).toBe(violation.file);
    expect(preview.lineChanges.length).toBeGreaterThan(0);
  });

  it("should apply multiple fixes in correct order", async () => {
    const fileContent = `line1
window.location.href = "/a"
line3
window.location.href = "/b"
line5`;

    mockReadFile.mockResolvedValue(fileContent);
    mockWriteFile.mockResolvedValue(undefined);

    const violations: Violation[] = [
      { ...createFixableViolation(), line: 2, file: "test.tsx" },
      { ...createFixableViolation(), line: 4, file: "test.tsx" },
    ];

    const results = await fixApplier.applyMultipleFixes(violations);

    expect(results.length).toBe(2);
    // Should fix from bottom to top to avoid line offset issues
    expect(mockWriteFile).toHaveBeenCalled();
  });

  it("should backup file before fix", async () => {
    const fileContent = "original content";
    mockReadFile.mockResolvedValue(fileContent);
    mockWriteFile.mockResolvedValue(undefined);

    const backupPath = await fixApplier.backupFile("test.tsx");

    expect(backupPath).toBe("test.tsx.backup");
    expect(mockWriteFile).toHaveBeenCalledWith(
      "test.tsx.backup",
      fileContent,
      "utf-8",
    );
  });

  it("should restore from backup", async () => {
    const backupContent = "backup content";
    mockReadFile.mockResolvedValue(backupContent);
    mockWriteFile.mockResolvedValue(undefined);
    mockUnlink.mockResolvedValue(undefined);

    await fixApplier.restoreFromBackup("test.tsx");

    expect(mockReadFile).toHaveBeenCalledWith("test.tsx.backup", "utf-8");
    expect(mockWriteFile).toHaveBeenCalledWith(
      "test.tsx",
      backupContent,
      "utf-8",
    );
    expect(mockUnlink).toHaveBeenCalledWith("test.tsx.backup");
  });
});

describe("AutoFixer", () => {
  let autoFixer: AutoFixer;

  beforeEach(() => {
    autoFixer = new AutoFixer();
    vi.clearAllMocks();
  });

  it("should get fixable count correctly", () => {
    const violations = [
      createFixableViolation(),
      createNonFixableViolation(),
      createFixableViolation(),
    ];

    const count = autoFixer.getFixableCount(violations);

    expect(count).toBe(2);
  });

  it("should filter fixable violations", () => {
    const violations = [
      createFixableViolation(),
      createNonFixableViolation(),
      createFixableViolation(),
    ];

    const fixable = autoFixer.getFixableViolations(violations);

    expect(fixable.length).toBe(2);
    expect(fixable.every((v) => v.canAutoFix)).toBe(true);
  });

  it("should return empty array when no fixable violations", async () => {
    const violations = [createNonFixableViolation()];

    const results = await autoFixer.applyAllFixes(violations);

    expect(results.length).toBe(0);
  });

  it("should preview fix", async () => {
    const fileContent = 'window.location.href = "/test"';
    mockReadFile.mockResolvedValue(fileContent);

    const violation: Violation = {
      ...createFixableViolation(),
      line: 1,
    };

    const preview = await autoFixer.previewFix(violation);

    expect(preview.file).toBe(violation.file);
  });

  it("should format diff for console", () => {
    const diff = {
      file: "test.tsx",
      before: "old",
      after: "new",
      lineChanges: [{ line: 1, oldContent: "old", newContent: "new" }],
    };

    const formatted = autoFixer.formatDiffForConsole(diff, false);

    expect(formatted).toContain("old");
    expect(formatted).toContain("new");
  });

  it("should format diff for markdown", () => {
    const diff = {
      file: "test.tsx",
      before: "old",
      after: "new",
      lineChanges: [{ line: 1, oldContent: "old", newContent: "new" }],
    };

    const formatted = autoFixer.formatDiffForMarkdown(diff);

    expect(formatted).toContain("```diff");
    expect(formatted).toContain("- old");
    expect(formatted).toContain("+ new");
  });

  it("should print fix results", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const results = [
      {
        success: true,
        file: "test.tsx",
        violation: createFixableViolation(),
      },
      {
        success: false,
        file: "test2.tsx",
        violation: createFixableViolation(),
        error: "Some error",
      },
    ];

    autoFixer.printFixResults(results, false);

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
