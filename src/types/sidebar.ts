import type { PermissionKey } from "./permissions";

/**
 * Type định nghĩa cho sub-item trong sidebar navigation
 */
export interface SidebarSubItem {
  /** Tiêu đề hiển thị */
  title: string;
  /** URL điều hướng */
  url: string;
  /** Permission key yêu cầu để hiển thị item này */
  requiredPermission?: PermissionKey;
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
  /** Key để lấy badge count từ context */
  badgeKey?: string;
  /** Permission key yêu cầu để hiển thị item này */
  requiredPermission?: PermissionKey;
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
