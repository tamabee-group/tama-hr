/**
 * Code Rules Checker CLI
 * Main entry point - wire tất cả components
 */

import * as fs from "fs";
import * as path from "path";
import { Scanner, buildImportGraph } from "../scanner";
import { ruleRegistry, registerAllRules } from "../rules";
import { ConsoleReporter, MarkdownReporter } from "../reporter";
import { AutoFixer } from "../auto-fixer";
import type {
  FileInfo,
  ParsedFile,
  ParsedJavaFile,
  RuleContext,
  ScanOptions,
  Violation,
} from "../types";

// ============================================
// CLI OPTIONS
// ============================================

export interface CLIOptions {
  /** Đường dẫn frontend project (tama-hr) */
  frontendPath?: string;
  /** Đường dẫn backend project (api-hr) */
  backendPath?: string;
  /** Chỉ scan frontend */
  frontendOnly?: boolean;
  /** Chỉ scan backend */
  backendOnly?: boolean;
  /** Tự động fix violations */
  fix?: boolean;
  /** Output markdown report */
  outputReport?: string;
  /** Không hiển thị màu */
  noColor?: boolean;
  /** Verbose mode */
  verbose?: boolean;
}

// ============================================
// CODE RULES CHECKER
// ============================================

/**
 * Code Rules Checker - Main class
 * Wire tất cả components và thực hiện scan
 */
export class CodeRulesChecker {
  private scanner: Scanner;
  private consoleReporter: ConsoleReporter;
  private markdownReporter: MarkdownReporter;
  private autoFixer: AutoFixer;
  private options: CLIOptions;

  constructor(options: CLIOptions = {}) {
    this.options = options;
    this.scanner = new Scanner();
    this.consoleReporter = new ConsoleReporter(!options.noColor);
    this.markdownReporter = new MarkdownReporter();
    this.autoFixer = new AutoFixer();

    // Đăng ký tất cả rules
    registerAllRules();
  }

  /**
   * Chạy scan trên cả 2 projects
   */
  async run(): Promise<Violation[]> {
    const allViolations: Violation[] = [];

    // Scan Frontend
    if (!this.options.backendOnly && this.options.frontendPath) {
      if (this.options.verbose) {
        console.log("\n[Scanning Frontend (tama-hr)...]\n");
      }
      const frontendViolations = await this.scanFrontend(
        this.options.frontendPath,
      );
      allViolations.push(...frontendViolations);
    }

    // Scan Backend
    if (!this.options.frontendOnly && this.options.backendPath) {
      if (this.options.verbose) {
        console.log("\n[Scanning Backend (api-hr)...]\n");
      }
      const backendViolations = await this.scanBackend(
        this.options.backendPath,
      );
      allViolations.push(...backendViolations);
    }

    // Generate report
    this.consoleReporter.generateConsoleReport(allViolations);

    // Output markdown report if requested
    if (this.options.outputReport) {
      const markdown =
        this.markdownReporter.generateMarkdownReport(allViolations);
      fs.writeFileSync(this.options.outputReport, markdown, "utf-8");
      console.log(`\n[Report saved to: ${this.options.outputReport}]`);
    }

    // Auto-fix if requested
    if (this.options.fix) {
      await this.applyFixes(allViolations);
    }

    return allViolations;
  }

  /**
   * Scan Frontend project
   */
  private async scanFrontend(projectPath: string): Promise<Violation[]> {
    const scanOptions: ScanOptions = {
      include: ["**/*.ts", "**/*.tsx"],
      exclude: [
        "**/node_modules/**",
        "**/.next/**",
        "**/dist/**",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
        "**/vitest.config.ts",
        "**/next.config.ts",
        "**/eslint.config.mjs",
        "**/postcss.config.mjs",
        "**/__tests__/**",
        "**/code-checker/**", // Exclude code-checker itself
      ],
      projectType: "frontend",
    };

    // Discover files
    const files = await this.scanner.scanDirectory(projectPath, scanOptions);
    if (this.options.verbose) {
      console.log(`  Found ${files.length} TypeScript/TSX files`);
    }

    // Parse files
    const parsedFiles: ParsedFile[] = [];
    for (const file of files) {
      try {
        const parsed = await this.scanner.parseTypeScriptFile(file);
        parsedFiles.push(parsed);
      } catch (error) {
        if (this.options.verbose) {
          console.warn(`  ⚠ Failed to parse: ${file.relativePath}`);
        }
      }
    }

    // Build import graph
    const importGraph = buildImportGraph(parsedFiles);

    // Create rule context
    const context: RuleContext = {
      projectRoot: projectPath,
      allFiles: files,
      importGraph,
    };

    // Run rules
    const violations: Violation[] = [];
    const frontendRules = ruleRegistry.getByProjectType("frontend");

    for (const parsedFile of parsedFiles) {
      for (const rule of frontendRules) {
        try {
          const ruleViolations = rule.check(parsedFile, context);
          violations.push(...ruleViolations);
        } catch (error) {
          if (this.options.verbose) {
            console.warn(
              `  ⚠ Rule ${rule.id} failed on ${parsedFile.file.relativePath}`,
            );
          }
        }
      }
    }

    if (this.options.verbose) {
      console.log(`  Found ${violations.length} violations`);
    }

    return violations;
  }

  /**
   * Scan Backend project
   */
  private async scanBackend(projectPath: string): Promise<Violation[]> {
    const scanOptions: ScanOptions = {
      include: ["**/*.java"],
      exclude: [
        "**/target/**",
        "**/build/**",
        "**/test/**",
        "**/*Test.java",
        "**/*Tests.java",
        "**/*Spec.java",
      ],
      projectType: "backend",
    };

    // Discover files
    const files = await this.scanner.scanDirectory(projectPath, scanOptions);
    if (this.options.verbose) {
      console.log(`  Found ${files.length} Java files`);
    }

    // Parse files
    const parsedFiles: ParsedJavaFile[] = [];
    for (const file of files) {
      try {
        const parsed = await this.scanner.parseJavaFile(file);
        parsedFiles.push(parsed);
      } catch (error) {
        if (this.options.verbose) {
          console.warn(`  ⚠ Failed to parse: ${file.relativePath}`);
        }
      }
    }

    // Create rule context (no import graph for Java)
    const context: RuleContext = {
      projectRoot: projectPath,
      allFiles: files,
      importGraph: { importedBy: new Map(), imports: new Map() },
    };

    // Run rules
    const violations: Violation[] = [];
    const backendRules = ruleRegistry.getByProjectType("backend");

    for (const parsedFile of parsedFiles) {
      for (const rule of backendRules) {
        try {
          const ruleViolations = rule.check(parsedFile, context);
          violations.push(...ruleViolations);
        } catch (error) {
          if (this.options.verbose) {
            console.warn(
              `  ⚠ Rule ${rule.id} failed on ${parsedFile.file.relativePath}`,
            );
          }
        }
      }
    }

    if (this.options.verbose) {
      console.log(`  Found ${violations.length} violations`);
    }

    return violations;
  }

  /**
   * Apply auto-fixes
   */
  private async applyFixes(violations: Violation[]): Promise<void> {
    const fixableViolations = this.autoFixer.getFixableViolations(violations);

    if (fixableViolations.length === 0) {
      console.log("\n[fix] No auto-fixable violations found.");
      return;
    }

    console.log(`\n[fix] Applying ${fixableViolations.length} auto-fixes...`);

    const results = await this.autoFixer.applyAllFixes(fixableViolations);
    this.autoFixer.printFixResults(results, !this.options.noColor);
  }

  /**
   * Get summary statistics
   */
  getSummary(violations: Violation[]) {
    return this.consoleReporter.generateSummary(violations);
  }
}

// ============================================
// CLI ARGUMENT PARSER
// ============================================

/**
 * Parse command line arguments
 */
export function parseArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--frontend":
      case "-f":
        options.frontendPath = args[++i];
        break;
      case "--backend":
      case "-b":
        options.backendPath = args[++i];
        break;
      case "--frontend-only":
        options.frontendOnly = true;
        break;
      case "--backend-only":
        options.backendOnly = true;
        break;
      case "--fix":
        options.fix = true;
        break;
      case "--output":
      case "-o":
        options.outputReport = args[++i];
        break;
      case "--no-color":
        options.noColor = true;
        break;
      case "--verbose":
      case "-v":
        options.verbose = true;
        break;
      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
    }
  }

  return options;
}

/**
 * Print help message
 */
function printHelp(): void {
  console.log(`
Code Rules Checker - Kiểm tra code tuân thủ coding rules

Usage:
  npx ts-node src/lib/code-checker/cli [options]

Options:
  -f, --frontend <path>   Đường dẫn frontend project (tama-hr)
  -b, --backend <path>    Đường dẫn backend project (api-hr)
  --frontend-only         Chỉ scan frontend
  --backend-only          Chỉ scan backend
  --fix                   Tự động fix violations có thể fix
  -o, --output <file>     Output markdown report
  --no-color              Không hiển thị màu
  -v, --verbose           Verbose mode
  -h, --help              Hiển thị help

Examples:
  npm run check:rules
  npm run check:rules:fix
  npx ts-node src/lib/code-checker/cli -f ./src -b ../api-hr/src --verbose
`);
}

// ============================================
// MAIN ENTRY POINT
// ============================================

/**
 * Main function - CLI entry point
 */
export async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  // Default paths nếu không được chỉ định
  if (!options.frontendPath && !options.backendPath) {
    // Detect workspace root
    const workspaceRoot = process.cwd();

    // Check if we're in tama-hr
    if (fs.existsSync(path.join(workspaceRoot, "src"))) {
      options.frontendPath = path.join(workspaceRoot, "src");
    }

    // Check for api-hr sibling
    const apiHrPath = path.join(workspaceRoot, "..", "api-hr", "src");
    if (fs.existsSync(apiHrPath)) {
      options.backendPath = apiHrPath;
    }
  }

  if (!options.frontendPath && !options.backendPath) {
    console.error(
      "Error: No project paths specified. Use --frontend or --backend options.",
    );
    process.exit(1);
  }

  const checker = new CodeRulesChecker(options);
  const violations = await checker.run();

  // Exit with error code if there are errors
  const summary = checker.getSummary(violations);
  if (summary.bySeverity.error > 0) {
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
}
