/**
 * Rule Registry
 * Quản lý và đăng ký tất cả rules
 */

import type { IRule } from "../interfaces/rule";
import type { ProjectType, RuleCategory } from "../types";

/**
 * Rule Registry - Singleton pattern
 */
class RuleRegistry {
  private rules: Map<string, IRule> = new Map();

  /**
   * Đăng ký một rule
   */
  register(rule: IRule): void {
    if (this.rules.has(rule.id)) {
      console.warn(`Rule ${rule.id} đã được đăng ký, sẽ bị ghi đè`);
    }
    this.rules.set(rule.id, rule);
  }

  /**
   * Đăng ký nhiều rules
   */
  registerAll(rules: IRule[]): void {
    for (const rule of rules) {
      this.register(rule);
    }
  }

  /**
   * Lấy rule theo ID
   */
  get(id: string): IRule | undefined {
    return this.rules.get(id);
  }

  /**
   * Lấy tất cả rules
   */
  getAll(): IRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Lấy rules theo project type
   */
  getByProjectType(projectType: ProjectType): IRule[] {
    return this.getAll().filter(
      (rule) => rule.projectType === projectType || rule.projectType === "both",
    );
  }

  /**
   * Lấy rules theo category
   */
  getByCategory(category: RuleCategory): IRule[] {
    return this.getAll().filter((rule) => rule.category === category);
  }

  /**
   * Lấy rules có thể auto-fix
   */
  getAutoFixable(): IRule[] {
    return this.getAll().filter((rule) => rule.canAutoFix);
  }

  /**
   * Xóa tất cả rules (dùng cho testing)
   */
  clear(): void {
    this.rules.clear();
  }

  /**
   * Số lượng rules đã đăng ký
   */
  get size(): number {
    return this.rules.size;
  }
}

// Singleton instance
export const ruleRegistry = new RuleRegistry();

/**
 * Decorator để tự động đăng ký rule
 */
export function RegisterRule() {
  return function <T extends new (...args: unknown[]) => IRule>(
    constructor: T,
  ) {
    const instance = new constructor();
    ruleRegistry.register(instance);
    return constructor;
  };
}
