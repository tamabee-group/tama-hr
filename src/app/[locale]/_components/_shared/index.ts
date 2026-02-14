// Re-export all shared components
// Organized by domain for better discoverability

// Display components (badges, time, currency)
export * from "./display";

// Attendance components (calendar, day detail, sections)
export * from "./attendance";

// Form components (responsive form, table)
export * from "./form";

// Payroll components (payslip card, list, table)
export * from "./payroll";

// Layout components (breadcrumb, mobile nav, notification)
export * from "./layout";

// Markdown renderer (react-markdown + Tailwind prose)
export { MarkdownRenderer } from "./_markdown-renderer";
