/**
 * Code Rules Checker
 * Main entry point - export tất cả modules
 */

// Types
export * from "./types";

// Interfaces
export * from "./interfaces";

// Scanner
export {
  Scanner,
  discoverFiles,
  buildImportGraph,
  defaultFrontendOptions,
  defaultBackendOptions,
  parseTypeScriptFile,
  parseJavaFile,
} from "./scanner";

// Rules
export {
  ruleRegistry,
  RegisterRule,
  BaseRule,
  registerAllRules,
} from "./rules";

// Reporter
export { ConsoleReporter, MarkdownReporter } from "./reporter";

// Auto-Fixer
export { AutoFixer, DiffGenerator, FixApplier } from "./auto-fixer";

// CLI
export { CodeRulesChecker, parseArgs, main } from "./cli";
