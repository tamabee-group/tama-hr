import { WorkMode } from "@/types/attendance-config";

/**
 * Các tab trong settings page
 */
export type SettingsTabKey =
  | "workMode"
  | "attendance"
  | "payroll"
  | "overtime"
  | "allowance"
  | "deduction";

/**
 * Cấu hình visibility cho mỗi tab dựa trên work mode
 * - true: luôn hiển thị
 * - false: luôn ẩn
 * - "FIXED_HOURS" | "FLEXIBLE_SHIFT": chỉ hiển thị ở mode đó
 */
type TabVisibility = boolean | WorkMode;

/**
 * Cấu hình visibility cho các tabs
 * Hiện tại tất cả tabs đều hiển thị ở cả hai modes
 * Có thể mở rộng để ẩn/hiện tabs dựa trên work mode
 */
const TAB_VISIBILITY_CONFIG: Record<SettingsTabKey, TabVisibility> = {
  workMode: true, // Luôn hiển thị
  attendance: true, // Luôn hiển thị
  payroll: true, // Luôn hiển thị
  overtime: true, // Luôn hiển thị
  allowance: true, // Luôn hiển thị
  deduction: true, // Luôn hiển thị
};

/**
 * Kiểm tra xem một tab có hiển thị hay không dựa trên work mode
 * @param tabKey - Key của tab cần kiểm tra
 * @param workMode - Work mode hiện tại
 * @returns true nếu tab hiển thị, false nếu ẩn
 */
export function isSettingsTabVisible(
  tabKey: SettingsTabKey,
  workMode: WorkMode,
): boolean {
  const visibility = TAB_VISIBILITY_CONFIG[tabKey];

  if (typeof visibility === "boolean") {
    return visibility;
  }

  // Nếu visibility là một WorkMode cụ thể, chỉ hiển thị khi mode khớp
  return visibility === workMode;
}

/**
 * Lấy danh sách các tabs hiển thị dựa trên work mode
 * @param allTabs - Danh sách tất cả các tabs
 * @param workMode - Work mode hiện tại
 * @returns Danh sách các tabs hiển thị
 */
export function getVisibleSettingsTabs<T extends { key: SettingsTabKey }>(
  allTabs: T[],
  workMode: WorkMode,
): T[] {
  return allTabs.filter((tab) => isSettingsTabVisible(tab.key, workMode));
}

/**
 * Cấu hình các sections trong mỗi tab cần ẩn/hiện dựa trên work mode
 * Key: tabKey.sectionKey
 * Value: WorkMode mà section đó hiển thị, hoặc true nếu luôn hiển thị
 */
type SectionVisibility = boolean | WorkMode;

const SECTION_VISIBILITY_CONFIG: Record<string, SectionVisibility> = {
  // Attendance tab - một số sections chỉ hiển thị ở FLEXIBLE_SHIFT mode
  // Hiện tại tất cả sections đều hiển thị
  "attendance.workingHours": true,
  "attendance.rounding": true,
  "attendance.gracePeriod": true,
  "attendance.deviceLocation": true,

  // Payroll tab - tất cả sections đều hiển thị
  "payroll.salaryType": true,
  "payroll.paymentSchedule": true,
  "payroll.standardWorking": true,

  // Overtime tab - tất cả sections đều hiển thị
  "overtime.general": true,
  "overtime.nightShift": true,
  "overtime.multipliers": true,
  "overtime.limits": true,
};

/**
 * Kiểm tra xem một section có hiển thị hay không dựa trên work mode
 * @param tabKey - Key của tab chứa section
 * @param sectionKey - Key của section cần kiểm tra
 * @param workMode - Work mode hiện tại
 * @returns true nếu section hiển thị, false nếu ẩn
 */
export function isSettingsSectionVisible(
  tabKey: SettingsTabKey,
  sectionKey: string,
  workMode: WorkMode,
): boolean {
  const key = `${tabKey}.${sectionKey}`;
  const visibility = SECTION_VISIBILITY_CONFIG[key];

  // Nếu không có config, mặc định hiển thị
  if (visibility === undefined) {
    return true;
  }

  if (typeof visibility === "boolean") {
    return visibility;
  }

  return visibility === workMode;
}
