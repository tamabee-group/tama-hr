/**
 * Tiện ích phân quyền theo role cho quản lý Deposit
 * Định nghĩa các UI elements nào được hiển thị/kích hoạt cho từng role
 */

// Các role của user
export type UserRole =
  | "ADMIN_TAMABEE"
  | "MANAGER_TAMABEE"
  | "EMPLOYEE_TAMABEE"
  | "ADMIN_COMPANY"
  | "MANAGER_COMPANY"
  | "EMPLOYEE_COMPANY";

// Các loại quyền cho quản lý deposit
export interface DepositPermissions {
  canViewDeposits: boolean;
  canApproveDeposits: boolean;
  canRejectDeposits: boolean;
  canCreateDeposits: boolean;
}

/**
 * Lấy quyền deposit dựa trên role của user
 *
 * Phân quyền theo role:
 * - ADMIN_TAMABEE: toàn quyền (xem, duyệt, từ chối)
 * - MANAGER_TAMABEE: xem + duyệt/từ chối deposits
 * - EMPLOYEE_TAMABEE: chỉ xem
 * - ADMIN_COMPANY: xem + tạo deposits
 * - MANAGER_COMPANY: chỉ xem
 * - EMPLOYEE_COMPANY: không có quyền
 */
export function getDepositPermissions(role: UserRole): DepositPermissions {
  switch (role) {
    case "ADMIN_TAMABEE":
      return {
        canViewDeposits: true,
        canApproveDeposits: true,
        canRejectDeposits: true,
        canCreateDeposits: false, // User Tamabee không tạo deposit
      };
    case "MANAGER_TAMABEE":
      return {
        canViewDeposits: true,
        canApproveDeposits: true,
        canRejectDeposits: true,
        canCreateDeposits: false,
      };
    case "EMPLOYEE_TAMABEE":
      return {
        canViewDeposits: true,
        canApproveDeposits: false,
        canRejectDeposits: false,
        canCreateDeposits: false,
      };
    case "ADMIN_COMPANY":
      return {
        canViewDeposits: true,
        canApproveDeposits: false,
        canRejectDeposits: false,
        canCreateDeposits: true,
      };
    case "MANAGER_COMPANY":
      return {
        canViewDeposits: true,
        canApproveDeposits: false,
        canRejectDeposits: false,
        canCreateDeposits: false,
      };
    case "EMPLOYEE_COMPANY":
      return {
        canViewDeposits: false,
        canApproveDeposits: false,
        canRejectDeposits: false,
        canCreateDeposits: false,
      };
    default:
      return {
        canViewDeposits: false,
        canApproveDeposits: false,
        canRejectDeposits: false,
        canCreateDeposits: false,
      };
  }
}

/**
 * Kiểm tra user có thể duyệt/từ chối deposits không
 * Chỉ ADMIN_TAMABEE và MANAGER_TAMABEE có quyền duyệt/từ chối
 */
export function canApproveRejectDeposits(role: UserRole): boolean {
  const permissions = getDepositPermissions(role);
  return permissions.canApproveDeposits && permissions.canRejectDeposits;
}

/**
 * Kiểm tra user có thể tạo deposits không
 * Chỉ ADMIN_COMPANY có quyền tạo deposits
 */
export function canCreateDeposits(role: UserRole): boolean {
  const permissions = getDepositPermissions(role);
  return permissions.canCreateDeposits;
}

/**
 * Kiểm tra user có thể xem deposits không
 * Tất cả role trừ EMPLOYEE_COMPANY đều có thể xem deposits
 */
export function canViewDeposits(role: UserRole): boolean {
  const permissions = getDepositPermissions(role);
  return permissions.canViewDeposits;
}

/**
 * Lấy tất cả role của Tamabee
 */
export function getTamabeeRoles(): UserRole[] {
  return ["ADMIN_TAMABEE", "MANAGER_TAMABEE", "EMPLOYEE_TAMABEE"];
}

/**
 * Lấy tất cả role của Company
 */
export function getCompanyRoles(): UserRole[] {
  return ["ADMIN_COMPANY", "MANAGER_COMPANY", "EMPLOYEE_COMPANY"];
}

/**
 * Lấy tất cả role
 */
export function getAllRoles(): UserRole[] {
  return [...getTamabeeRoles(), ...getCompanyRoles()];
}
