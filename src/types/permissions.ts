// Permission types và constants cho hệ thống phân quyền Tamabee

/**
 * Định nghĩa các permission keys và roles được phép truy cập
 * Mỗi permission key map đến danh sách roles có quyền thực hiện
 */
export const TAMABEE_PERMISSIONS = {
  // Wallet operations - Thao tác ví
  DIRECT_WALLET_MANIPULATION: ["ADMIN_TAMABEE"],
  VIEW_WALLETS: ["ADMIN_TAMABEE", "MANAGER_TAMABEE"],

  // Deposit operations - Thao tác nạp tiền
  DEPOSIT_APPROVAL: ["ADMIN_TAMABEE", "MANAGER_TAMABEE"],
  VIEW_DEPOSITS: ["ADMIN_TAMABEE", "MANAGER_TAMABEE", "EMPLOYEE_TAMABEE"],

  // Commission operations - Thao tác hoa hồng
  COMMISSION_PAYMENT: ["ADMIN_TAMABEE", "MANAGER_TAMABEE"],
  VIEW_COMMISSIONS: ["ADMIN_TAMABEE", "MANAGER_TAMABEE", "EMPLOYEE_TAMABEE"],

  // System settings - Cài đặt hệ thống
  SYSTEM_SETTINGS: ["ADMIN_TAMABEE"],

  // Company management - Quản lý công ty
  VIEW_ALL_COMPANIES: ["ADMIN_TAMABEE", "MANAGER_TAMABEE"],
  VIEW_REFERRED_COMPANIES: ["EMPLOYEE_TAMABEE"],

  // User management - Quản lý người dùng
  MANAGE_USERS: ["ADMIN_TAMABEE"],
  VIEW_USERS: ["ADMIN_TAMABEE", "MANAGER_TAMABEE"],
} as const;

export type PermissionKey = keyof typeof TAMABEE_PERMISSIONS;
export type TamabeeRole =
  | "ADMIN_TAMABEE"
  | "MANAGER_TAMABEE"
  | "EMPLOYEE_TAMABEE";

/**
 * Kiểm tra user có permission không
 * @param role Role của user
 * @param permission Permission key cần kiểm tra
 * @returns true nếu user có permission
 */
export function hasPermission(
  role: string,
  permission: PermissionKey,
): boolean {
  const allowedRoles = TAMABEE_PERMISSIONS[permission] as readonly string[];
  return allowedRoles.includes(role);
}

/**
 * Kiểm tra user có phải Admin Tamabee không
 */
export function isAdminTamabee(role: string): boolean {
  return role === "ADMIN_TAMABEE";
}

/**
 * Kiểm tra user có phải Tamabee staff (Admin hoặc Manager) không
 */
export function isTamabeeStaff(role: string): boolean {
  return role === "ADMIN_TAMABEE" || role === "MANAGER_TAMABEE";
}

/**
 * Kiểm tra user có phải Employee Tamabee không
 */
export function isEmployeeTamabee(role: string): boolean {
  return role === "EMPLOYEE_TAMABEE";
}
