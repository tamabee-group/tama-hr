import type { PermissionKey } from "./permissions";
import type { CompanyPermissionKey } from "./company-permissions";

/**
 * Type định nghĩa cho sub-item trong sidebar navigation
 */
export interface SidebarSubItem {
  /** Tiêu đề hiển thị */
  title: string;
  /** URL điều hướng */
  url: string;
  /** Permission key yêu cầu để hiển thị item này (Tamabee) */
  requiredPermission?: PermissionKey;
  /** Permission key yêu cầu để hiển thị item này (Company) */
  requiredCompanyPermission?: CompanyPermissionKey;
}

/**
 * Type định nghĩa cho item trong sidebar navigation
 * Dùng chung cho tất cả các layout: tamabee, company, employee
 */
export interface SidebarItem {
  /** Tiêu đề hiển thị */
  title: string;
  /** URL điều hướng */
  url: string;
  /** Icon hiển thị (Lucide icon component) */
  icon: React.ReactNode;
  /** Danh sách sub-items (nếu có) */
  items?: SidebarSubItem[];
  /** Permission key yêu cầu để hiển thị item này (Tamabee) */
  requiredPermission?: PermissionKey;
  /** Permission key yêu cầu để hiển thị item này (Company) */
  requiredCompanyPermission?: CompanyPermissionKey;
  /** Số badge hiển thị bên phải item (ví dụ: pending count) */
  badgeCount?: number;
}

/**
 * Type định nghĩa cho nhóm sidebar items
 */
export interface SidebarGroup {
  /** Tên nhóm hiển thị */
  label: string;
  /** Danh sách items trong nhóm */
  items: SidebarItem[];
}

/**
 * Type định nghĩa cho header của sidebar
 */
export interface SidebarHeaderConfig {
  /** Logo URL hoặc ReactNode component */
  logo?: string | React.ReactNode;
  /** Tên hiển thị */
  name: string;
  /** Logo fallback khi không có logo */
  fallback?: string;
}
