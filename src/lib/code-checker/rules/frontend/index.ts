/**
 * Frontend Rules Index
 * Export tất cả frontend rules
 */

// Navigation Rules
export * from "./navigation-rules";

// API Call Rules
export * from "./api-call-rules";

// Auth Rules
export * from "./auth-rules";

// Component Rules
export * from "./component-rules";

// Component Placement Rules
export * from "./component-placement-rules";

// Type Rules
export * from "./type-rules";

// Table Rules
export * from "./table-rules";

// Statistics Card Rules
export * from "./statistics-card-rules";

// Image Upload Rules
export * from "./image-upload-rules";

// Performance Rules
export * from "./performance-rules";

// i18n Rules
export * from "./i18n-rules";

// Currency Rules
export * from "./currency-rules";

// Comment Rules
export * from "./comment-rules";

// Hàm đăng ký tất cả frontend rules
import { ruleRegistry } from "../rule-registry";
import { NavigationHrefRule, NavigationAnchorRule } from "./navigation-rules";
import {
  ApiClientRule,
  ApiServerRule,
  DirectFetchRule,
  PaginationConstantsRule,
} from "./api-call-rules";
import { UseAuthHookRule, DirectLocalStorageRule } from "./auth-rules";
import {
  ComponentSizeRule,
  PageUseClientRule,
  InternalComponentPrefixRule,
} from "./component-rules";
import { ComponentPlacementRule } from "./component-placement-rules";
import { AnyTypeRule, EnumImportRule } from "./type-rules";
import { TableSttColumnRule, BaseTableImportRule } from "./table-rules";
import {
  StatisticsCardIconRule,
  StatisticsCardColorRule,
} from "./statistics-card-rules";
import { ImageCompressionRule } from "./image-upload-rules";
import { NextImageRule, SuspenseBoundaryRule } from "./performance-rules";
import { HardcodedStringRule, UseTranslationsRule } from "./i18n-rules";
import { FormatCurrencyRule } from "./currency-rules";
import { RequirementCommentRule } from "./comment-rules";

/**
 * Đăng ký tất cả frontend rules vào registry
 */
export function registerFrontendRules(): void {
  const rules = [
    // Navigation
    new NavigationHrefRule(),
    new NavigationAnchorRule(),
    // API Calls
    new ApiClientRule(),
    new ApiServerRule(),
    new DirectFetchRule(),
    new PaginationConstantsRule(),
    // Auth
    new UseAuthHookRule(),
    new DirectLocalStorageRule(),
    // Components
    new ComponentSizeRule(),
    new PageUseClientRule(),
    new InternalComponentPrefixRule(),
    // Component Placement
    new ComponentPlacementRule(),
    // Types
    new AnyTypeRule(),
    new EnumImportRule(),
    // Tables
    new TableSttColumnRule(),
    new BaseTableImportRule(),
    // Statistics Cards
    new StatisticsCardIconRule(),
    new StatisticsCardColorRule(),
    // Image Upload
    new ImageCompressionRule(),
    // Performance
    new NextImageRule(),
    new SuspenseBoundaryRule(),
    // i18n
    new HardcodedStringRule(),
    new UseTranslationsRule(),
    // Currency
    new FormatCurrencyRule(),
    // Comments
    new RequirementCommentRule(),
  ];

  ruleRegistry.registerAll(rules);
}
