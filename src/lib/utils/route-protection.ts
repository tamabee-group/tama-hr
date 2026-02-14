import { UserRole } from "@/types/user";
import { TAMABEE_ADMIN_ROLES } from "@/types/auth";

// Các locale được hỗ trợ
const LOCALES = ["vi", "en", "ja"];

/**
 * Kết quả kiểm tra quyền truy cập route
 */
export type RouteAccessResult =
  | { allowed: true }
  | { allowed: false; reason: "unauthorized_role" | "missing_tenant_domain" };

/**
 * Loại bỏ locale prefix từ pathname
 * /vi/admin/companies -> /admin/companies
 * /admin/companies -> /admin/companies
 */
export function removeLocalePrefix(pathname: string): string {
  const localePattern = LOCALES.join("|");
  return pathname.replace(new RegExp(`^/(${localePattern})`), "") || "/";
}

/**
 * Kiểm tra path có phải admin route không
 * Admin routes: /admin, /admin/*, /vi/admin, /vi/admin/*
 */
export function isAdminRoute(pathname: string): boolean {
  const pathWithoutLocale = removeLocalePrefix(pathname);
  return (
    pathWithoutLocale === "/admin" || pathWithoutLocale.startsWith("/admin/")
  );
}

/**
 * Kiểm tra path có phải dashboard route không
 * Dashboard routes: /dashboard, /dashboard/*, /vi/dashboard, /vi/dashboard/*
 */
export function isDashboardRoute(pathname: string): boolean {
  const pathWithoutLocale = removeLocalePrefix(pathname);
  return (
    pathWithoutLocale === "/dashboard" ||
    pathWithoutLocale.startsWith("/dashboard/")
  );
}

/**
 * Kiểm tra path có phải support route không
 * Support routes: /support, /support/*, /vi/support, /vi/support/*
 */
export function isSupportRoute(pathname: string): boolean {
  const pathWithoutLocale = removeLocalePrefix(pathname);
  return (
    pathWithoutLocale === "/support" ||
    pathWithoutLocale.startsWith("/support/")
  );
}

/**
 * Kiểm tra quyền truy cập admin route
 * Chỉ ADMIN_TAMABEE và MANAGER_TAMABEE được phép truy cập
 */
export function checkAdminRouteAccess(role: UserRole): RouteAccessResult {
  if (TAMABEE_ADMIN_ROLES.includes(role)) {
    return { allowed: true };
  }
  return { allowed: false, reason: "unauthorized_role" };
}

/**
 * Kiểm tra quyền truy cập dashboard route
 * Cần có tenantDomain (kể cả "tamabee")
 */
export function checkDashboardRouteAccess(
  tenantDomain: string | null | undefined,
): RouteAccessResult {
  if (tenantDomain) {
    return { allowed: true };
  }
  return { allowed: false, reason: "missing_tenant_domain" };
}

/**
 * Kiểm tra quyền truy cập support route
 * Tất cả Tamabee roles được phép truy cập
 */
export function checkSupportRouteAccess(role: UserRole): RouteAccessResult {
  const allowedRoles: UserRole[] = [
    "EMPLOYEE_TAMABEE",
    "ADMIN_TAMABEE",
    "MANAGER_TAMABEE",
  ];
  if (allowedRoles.includes(role)) {
    return { allowed: true };
  }
  return { allowed: false, reason: "unauthorized_role" };
}

/**
 * Kiểm tra quyền truy cập route dựa trên pathname, role và tenantDomain
 * Trả về kết quả kiểm tra quyền
 */
export function checkRouteAccess(
  pathname: string,
  role: UserRole,
  tenantDomain: string | null | undefined,
): RouteAccessResult {
  // Admin routes - chỉ Tamabee admin
  if (isAdminRoute(pathname)) {
    return checkAdminRouteAccess(role);
  }

  // Support routes - Tamabee employees
  if (isSupportRoute(pathname)) {
    return checkSupportRouteAccess(role);
  }

  // Dashboard routes - cần tenantDomain
  if (isDashboardRoute(pathname)) {
    return checkDashboardRouteAccess(tenantDomain);
  }

  // Các routes khác - cho phép
  return { allowed: true };
}
