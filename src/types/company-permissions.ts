// Permission types và constants cho hệ thống phân quyền Company

/**
 * Định nghĩa các permission keys và roles được phép truy cập trong Company
 * Mỗi permission key map đến danh sách roles có quyền thực hiện
 */
export const COMPANY_PERMISSIONS = {
  // Dashboard - Bảng điều khiển
  VIEW_DASHBOARD: ["ADMIN_COMPANY", "MANAGER_COMPANY"],

  // Employee management - Quản lý nhân viên
  MANAGE_EMPLOYEES: ["ADMIN_COMPANY", "MANAGER_COMPANY"],
  VIEW_EMPLOYEES: ["ADMIN_COMPANY", "MANAGER_COMPANY"],

  // Company profile - Thông tin công ty
  VIEW_COMPANY_PROFILE: ["ADMIN_COMPANY", "MANAGER_COMPANY"],
  EDIT_COMPANY_PROFILE: ["ADMIN_COMPANY"],

  // Attendance management - Quản lý chấm công
  VIEW_ALL_ATTENDANCE: ["ADMIN_COMPANY", "MANAGER_COMPANY"],
  MANAGE_ADJUSTMENTS: ["ADMIN_COMPANY", "MANAGER_COMPANY"],

  // Schedule management - Quản lý lịch làm việc
  MANAGE_SCHEDULES: ["ADMIN_COMPANY", "MANAGER_COMPANY"],
  VIEW_SCHEDULES: ["ADMIN_COMPANY", "MANAGER_COMPANY"],

  // HR management - Quản lý nhân sự
  MANAGE_HOLIDAYS: ["ADMIN_COMPANY", "MANAGER_COMPANY"],
  MANAGE_LEAVE_REQUESTS: ["ADMIN_COMPANY", "MANAGER_COMPANY"],

  // Finance - Tài chính
  VIEW_WALLET: ["ADMIN_COMPANY", "MANAGER_COMPANY"],
  MANAGE_DEPOSITS: ["ADMIN_COMPANY"],
  VIEW_PAYROLL: ["ADMIN_COMPANY", "MANAGER_COMPANY"],
  MANAGE_PAYROLL: ["ADMIN_COMPANY"],

  // Reports - Báo cáo
  VIEW_REPORTS: ["ADMIN_COMPANY", "MANAGER_COMPANY"],

  // Settings - Cài đặt
  MANAGE_SETTINGS: ["ADMIN_COMPANY"],
} as const;

export type CompanyPermissionKey = keyof typeof COMPANY_PERMISSIONS;
export type CompanyRole =
  | "ADMIN_COMPANY"
  | "MANAGER_COMPANY"
  | "EMPLOYEE_COMPANY";

/**
 * Kiểm tra user có permission trong Company không
 * @param role Role của user
 * @param permission Permission key cần kiểm tra
 * @returns true nếu user có permission
 */
export function hasCompanyPermission(
  role: string,
  permission: CompanyPermissionKey,
): boolean {
  const allowedRoles = COMPANY_PERMISSIONS[permission] as readonly string[];
  return allowedRoles.includes(role);
}

/**
 * Kiểm tra user có phải Admin Company không
 */
export function isAdminCompany(role: string): boolean {
  return role === "ADMIN_COMPANY";
}

/**
 * Kiểm tra user có phải Manager Company không
 */
export function isManagerCompany(role: string): boolean {
  return role === "MANAGER_COMPANY";
}

/**
 * Kiểm tra user có phải Company staff (Admin hoặc Manager) không
 */
export function isCompanyStaff(role: string): boolean {
  return role === "ADMIN_COMPANY" || role === "MANAGER_COMPANY";
}

/**
 * Kiểm tra user có phải Employee Company không
 */
export function isEmployeeCompany(role: string): boolean {
  return role === "EMPLOYEE_COMPANY";
}
