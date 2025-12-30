#!/usr/bin/env npx ts-node
/**
 * Code Rules Checker Script
 * Chạy từ npm scripts: npm run check:rules
 */

import * as path from "path";
import * as fs from "fs";
import {
  CodeRulesChecker,
  type CLIOptions,
} from "../src/lib/code-checker/cli/index";

async function run(): Promise<void> {
  const args = process.argv.slice(2);
  const options: CLIOptions = {
    verbose: args.includes("--verbose") || args.includes("-v"),
    fix: args.includes("--fix"),
    noColor: args.includes("--no-color"),
  };

  // Detect project paths
  const workspaceRoot = process.cwd();

  // Frontend path (tama-hr/src)
  const frontendSrc = path.join(workspaceRoot, "src");
  if (fs.existsSync(frontendSrc)) {
    options.frontendPath = frontendSrc;
  }

  // Backend path (api-hr/src) - sibling folder
  const backendSrc = path.join(workspaceRoot, "..", "api-hr", "src");
  if (fs.existsSync(backendSrc)) {
    options.backendPath = backendSrc;
  }

  // Check for --frontend-only or --backend-only
  if (args.includes("--frontend-only")) {
    options.frontendOnly = true;
  }
  if (args.includes("--backend-only")) {
    options.backendOnly = true;
  }

  // Output report
  const outputIndex = args.findIndex((a) => a === "--output" || a === "-o");
  if (outputIndex !== -1 && args[outputIndex + 1]) {
    options.outputReport = args[outputIndex + 1];
  }

  // Validate paths
  if (!options.frontendPath && !options.backendPath) {
    console.error("[ERROR] Could not find project paths.");
    console.error("        Make sure you are running from tama-hr directory.");
    process.exit(1);
  }

  console.log("[Code Rules Checker]\n");

  if (options.frontendPath && !options.backendOnly) {
    console.log(`[Frontend] ${options.frontendPath}`);
  }
  if (options.backendPath && !options.frontendOnly) {
    console.log(`[Backend] ${options.backendPath}`);
  }
  if (options.fix) {
    console.log("[Auto-fix] enabled");
  }

  const checker = new CodeRulesChecker(options);
  const violations = await checker.run();

  // Exit with error code if there are errors
  const summary = checker.getSummary(violations);

  if (summary.bySeverity.error > 0) {
    process.exit(1);
  }
}

run().catch((error) => {
  console.error("[ERROR]", error.message);
  if (process.env.DEBUG) {
    console.error(error.stack);
  }
  process.exit(1);
});
