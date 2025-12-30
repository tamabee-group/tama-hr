/**
 * Rules Module
 * Export rule registry và base classes
 */

export { ruleRegistry, RegisterRule } from "./rule-registry";
export { BaseRule } from "../interfaces/rule";

// Frontend Rules
export * from "./frontend";
export { registerFrontendRules } from "./frontend";

// Backend Rules
export * from "./backend";
export { backendRules } from "./backend";

import { ruleRegistry } from "./rule-registry";
import { backendRules } from "./backend";
import { registerFrontendRules } from "./frontend";

/**
 * Đăng ký tất cả backend rules vào registry
 */
export function registerBackendRules(): void {
  ruleRegistry.registerAll(backendRules);
}

/**
 * Đăng ký tất cả rules (frontend + backend)
 */
export function registerAllRules(): void {
  // Register frontend rules
  registerFrontendRules();

  // Register backend rules
  registerBackendRules();
}
