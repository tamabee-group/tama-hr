/**
 * Các tab trong settings page
 */
export type SettingsTabKey =
  | "attendance"
  | "payroll"
  | "overtime"
  | "break"
  | "salaryItem";

/**
 * Kiểm tra xem một tab có hiển thị hay không
 * Hiện tại tất cả tabs đều hiển thị
 * @returns true
 */
export function isSettingsTabVisible(): boolean {
  return true;
}

/**
 * Lấy danh sách các tabs hiển thị
 * Hiện tại trả về tất cả tabs
 * @param allTabs - Danh sách tất cả các tabs
 * @returns Danh sách các tabs
 */
export function getVisibleSettingsTabs<T extends { key: SettingsTabKey }>(
  allTabs: T[],
): T[] {
  return allTabs;
}

/**
 * Kiểm tra xem một section có hiển thị hay không
 * Hiện tại tất cả sections đều hiển thị
 * @returns true
 */
export function isSettingsSectionVisible(): boolean {
  return true;
}
