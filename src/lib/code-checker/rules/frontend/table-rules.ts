/**
 * Table Rules (FE-TABLE-001, FE-TABLE-002)
 * Check tables compliance with standard patterns
 */

import { BaseRule } from "../../interfaces/rule";
import type { ParsedFile, RuleContext, Violation } from "../../types";

/**
 * FE-TABLE-001: STT column required
 * Verify STT (index) column exists as first column in tables
 */
export class TableSttColumnRule extends BaseRule {
  id = "FE-TABLE-001";
  name = "STT column required";
  category = "tables" as const;
  severity = "warning" as const;
  description = "Table must have STT (row number) column as first column";
  projectType = "frontend" as const;
  canAutoFix = false;

  check(file: ParsedFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Find table definitions
    const tablePatterns = [
      /columns\s*[=:]\s*\[/g, // columns = [ or columns: [
      /<Table/g, // <Table component
      /<BaseTable/g, // <BaseTable component
      /DataTable/g, // DataTable component
    ];

    let hasTableDefinition = false;
    let tableStartLine = -1;

    for (let i = 0; i < file.lines.length; i++) {
      const line = file.lines[i];

      for (const pattern of tablePatterns) {
        if (pattern.test(line)) {
          hasTableDefinition = true;
          tableStartLine = i + 1;
          break;
        }
        pattern.lastIndex = 0;
      }

      if (hasTableDefinition) break;
    }

    if (!hasTableDefinition) {
      return violations;
    }

    // Check for STT column
    const sttPatterns = [
      /['"]STT['"]/i,
      /['"]#['"]/,
      /header:\s*['"]STT['"]/i,
      /header:\s*['"]#['"]/,
      /accessorKey:\s*['"]stt['"]/i,
      /id:\s*['"]stt['"]/i,
      /key:\s*['"]stt['"]/i,
    ];

    let hasSttColumn = false;
    for (const pattern of sttPatterns) {
      if (pattern.test(file.content)) {
        hasSttColumn = true;
        break;
      }
    }

    // Check STT calculation pattern
    const sttCalculationPatterns = [
      /page\s*\*\s*pageSize\s*\+\s*index\s*\+\s*1/,
      /page\s*\*\s*limit\s*\+\s*index\s*\+\s*1/,
      /\(page\s*-\s*1\)\s*\*\s*pageSize\s*\+\s*index\s*\+\s*1/,
      /currentPage\s*\*\s*pageSize\s*\+\s*index\s*\+\s*1/,
    ];

    let hasCorrectSttCalculation = false;
    for (const pattern of sttCalculationPatterns) {
      if (pattern.test(file.content)) {
        hasCorrectSttCalculation = true;
        break;
      }
    }

    if (!hasSttColumn) {
      violations.push(
        this.createViolation({
          file: file.file.relativePath,
          line: tableStartLine,
          column: 1,
          message: "Table does not have STT (row number) column",
          suggestion: 'Add STT column as first column with header "STT" or "#"',
          codeSnippet: file.lines[tableStartLine - 1]?.trim() || "",
        }),
      );
    } else if (!hasCorrectSttCalculation) {
      // Find line with STT column
      for (let i = 0; i < file.lines.length; i++) {
        const line = file.lines[i];
        for (const pattern of sttPatterns) {
          if (pattern.test(line)) {
            violations.push(
              this.createViolation({
                file: file.file.relativePath,
                line: i + 1,
                column: 1,
                message: "STT column does not have correct calculation formula",
                suggestion: "Use formula: page * pageSize + index + 1",
                codeSnippet: line.trim(),
              }),
            );
            break;
          }
        }
      }
    }

    return violations;
  }
}

/**
 * FE-TABLE-002: Correct BaseTable import
 * Verify correct import from @/app/[locale]/_components/_base/base-table
 */
export class BaseTableImportRule extends BaseRule {
  id = "FE-TABLE-002";
  name = "Correct BaseTable import";
  category = "tables" as const;
  severity = "warning" as const;
  description =
    "BaseTable must be imported from @/app/[locale]/_components/_base/base-table";
  projectType = "frontend" as const;
  canAutoFix = true;

  check(file: ParsedFile, _context: RuleContext): Violation[] {
    const violations: Violation[] = [];

    // Check if BaseTable is used
    if (!file.content.includes("BaseTable")) {
      return violations;
    }

    // Find BaseTable import
    const baseTableImport = file.imports.find(
      (imp) =>
        imp.namedImports.includes("BaseTable") ||
        imp.defaultImport === "BaseTable",
    );

    if (!baseTableImport) {
      // Find line using BaseTable
      for (let i = 0; i < file.lines.length; i++) {
        const line = file.lines[i];
        if (line.includes("<BaseTable") || line.includes("BaseTable")) {
          violations.push(
            this.createViolation({
              file: file.file.relativePath,
              line: i + 1,
              column: 1,
              message: "BaseTable is used but not imported",
              suggestion:
                "Add import { BaseTable } from '@/app/[locale]/_components/_base/base-table'",
              codeSnippet: line.trim(),
              fixCode:
                "import { BaseTable } from '@/app/[locale]/_components/_base/base-table';",
            }),
          );
          break;
        }
      }
      return violations;
    }

    // Check if import path is correct
    const correctPaths = [
      "@/app/[locale]/_components/_base/base-table",
      "../_components/_base/base-table",
      "../../_components/_base/base-table",
      "../../../_components/_base/base-table",
    ];

    const isCorrectPath = correctPaths.some((path) =>
      baseTableImport.source.includes("base-table"),
    );

    if (!isCorrectPath) {
      violations.push(
        this.createViolation({
          file: file.file.relativePath,
          line: baseTableImport.line,
          column: 1,
          message: `BaseTable imported from incorrect path: ${baseTableImport.source}`,
          suggestion:
            "Import from '@/app/[locale]/_components/_base/base-table'",
          codeSnippet: file.lines[baseTableImport.line - 1]?.trim() || "",
          fixCode:
            "import { BaseTable } from '@/app/[locale]/_components/_base/base-table';",
        }),
      );
    }

    return violations;
  }
}
