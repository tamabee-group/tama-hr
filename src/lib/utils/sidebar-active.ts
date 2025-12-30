/**
 * Utility functions cho sidebar active state
 */

import type { SidebarItem } from "@/types/sidebar";

/**
 * Kiểm tra xem một sidebar item có active hay không dựa trên current route
 * @param item - Sidebar item cần kiểm tra
 * @param pathname - Current pathname
 * @returns true nếu item hoặc một trong các sub-items của nó active
 */
export function isSidebarItemActive(
  item: SidebarItem,
  pathname: string,
): boolean {
  // Nếu item có sub-items, kiểm tra xem có sub-item nào active không
  if (item.items && item.items.length > 0) {
    return item.items.some((subItem) => isRouteActive(subItem.url, pathname));
  }

  // Nếu không có sub-items, kiểm tra trực tiếp url của item
  return isRouteActive(item.url, pathname);
}

/**
 * Kiểm tra xem một route có active hay không
 * @param itemUrl - URL của sidebar item
 * @param pathname - Current pathname
 * @returns true nếu route active
 */
export function isRouteActive(itemUrl: string, pathname: string): boolean {
  // Bỏ qua các URL placeholder (#)
  if (itemUrl === "#") {
    return false;
  }

  // Exact match cho trang chủ
  if (itemUrl === "/") {
    return pathname === "/" || pathname === "";
  }

  // Kiểm tra pathname có bắt đầu bằng itemUrl không
  // Điều này cho phép active state cho các nested routes
  // Ví dụ: /company/wallet/deposits sẽ active cho /company/wallet
  return pathname === itemUrl || pathname.startsWith(`${itemUrl}/`);
}

/**
 * Tìm sidebar item active dựa trên current route
 * @param items - Danh sách sidebar items
 * @param pathname - Current pathname
 * @returns Sidebar item active hoặc undefined
 */
export function findActiveSidebarItem(
  items: SidebarItem[],
  pathname: string,
): SidebarItem | undefined {
  return items.find((item) => isSidebarItemActive(item, pathname));
}

/**
 * Kiểm tra xem có đúng một sidebar item active hay không
 * @param items - Danh sách sidebar items
 * @param pathname - Current pathname
 * @returns true nếu có đúng một item active
 */
export function hasExactlyOneActiveItem(
  items: SidebarItem[],
  pathname: string,
): boolean {
  const activeItems = items.filter((item) =>
    isSidebarItemActive(item, pathname),
  );
  return activeItems.length === 1;
}
