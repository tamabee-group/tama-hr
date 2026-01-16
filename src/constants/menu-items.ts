import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Clock,
  Wallet,
  Users,
  Settings,
  Building,
  Package,
  CalendarDays,
  FileText,
  UserCircle,
  Receipt,
  User,
  ClipboardList,
  CreditCard,
  Network,
} from "lucide-react";
import type { UserRole } from "@/types/enums";

/**
 * Interface cho menu item trong sidebar
 */
export interface MenuItem {
  code: string;
  labelKey: string;
  icon: LucideIcon;
  href: string;
  featureCode?: string;
  roles?: UserRole[];
  children?: MenuItem[];
  badgeKey?: string;
}

/**
 * Interface cho menu group (nhóm các menu items)
 */
export interface MenuGroup {
  code: string;
  labelKey: string;
  items: MenuItem[];
  roles?: UserRole[];
}

// ============================================================================
// ROLE DEFINITIONS
// ============================================================================

/** Roles có quyền quản lý (Admin và Manager) */
const MANAGEMENT_ROLES: UserRole[] = [
  "ADMIN_TAMABEE",
  "MANAGER_TAMABEE",
  "ADMIN_COMPANY",
  "MANAGER_COMPANY",
];

/** Roles Admin only */
const ADMIN_ROLES: UserRole[] = ["ADMIN_TAMABEE", "ADMIN_COMPANY"];

/** Roles Tamabee (Admin và Manager) */
const TAMABEE_ADMIN_ROLES: UserRole[] = ["ADMIN_TAMABEE", "MANAGER_TAMABEE"];

/** Roles Company (tất cả nhân viên công ty) */
const COMPANY_ROLES: UserRole[] = [
  "ADMIN_COMPANY",
  "MANAGER_COMPANY",
  "EMPLOYEE_COMPANY",
];

// ============================================================================
// ADMIN MENU (TamabeeLayout - /admin/*)
// ============================================================================

export const ADMIN_MENU_ITEMS: MenuItem[] = [
  {
    code: "dashboard",
    labelKey: "sidebar.items.dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    code: "companies",
    labelKey: "sidebar.items.customers",
    icon: Building,
    href: "/admin/companies",
  },
  {
    code: "deposits",
    labelKey: "sidebar.items.deposits",
    icon: Receipt,
    href: "/admin/deposits",
    badgeKey: "pendingDeposits",
  },
  {
    code: "billing",
    labelKey: "sidebar.items.billing",
    icon: CreditCard,
    href: "/admin/billing",
    roles: ["ADMIN_TAMABEE"],
  },
  {
    code: "plans",
    labelKey: "sidebar.items.plans",
    icon: Package,
    href: "/admin/plans",
    roles: ["ADMIN_TAMABEE"],
  },
  {
    code: "settings",
    labelKey: "sidebar.items.settings",
    icon: Settings,
    href: "/admin/settings",
    roles: ["ADMIN_TAMABEE"],
  },
];

// ============================================================================
// DASHBOARD MENU GROUPS (DashboardLayout - /dashboard/*)
// ============================================================================

/**
 * Menu groups cho Dashboard
 * Chia thành: Tổng quan, Của tôi, Quản lý nhân sự, Cài đặt
 */
export const DASHBOARD_MENU_GROUPS: MenuGroup[] = [
  // ========== TỔNG QUAN ==========
  {
    code: "overview",
    labelKey: "sidebar.groups.overview",
    items: [
      {
        code: "dashboard",
        labelKey: "sidebar.items.dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
      },
      {
        code: "platform-admin",
        labelKey: "sidebar.items.platformAdmin",
        icon: Building,
        href: "/admin/companies",
        roles: TAMABEE_ADMIN_ROLES,
      },
    ],
  },

  // ========== CỦA TÔI (Employee features) ==========
  {
    code: "my-workspace",
    labelKey: "sidebar.groups.myWorkspace",
    items: [
      {
        code: "my-attendance",
        labelKey: "sidebar.items.myAttendance",
        icon: Clock,
        href: "/dashboard/attendance/me",
        featureCode: "ATTENDANCE",
      },
      {
        code: "my-schedule",
        labelKey: "sidebar.items.mySchedule",
        icon: CalendarDays,
        href: "/dashboard/schedules/me",
        featureCode: "ATTENDANCE",
      },
      {
        code: "my-payslip",
        labelKey: "sidebar.items.myPayroll",
        icon: Wallet,
        href: "/dashboard/payroll/me",
        featureCode: "PAYROLL",
      },
      {
        code: "my-leave",
        labelKey: "sidebar.items.myLeave",
        icon: FileText,
        href: "/dashboard/leave/me",
        featureCode: "LEAVE",
      },
      {
        code: "my-profile",
        labelKey: "sidebar.items.myProfile",
        icon: User,
        href: "/dashboard/me",
      },
    ],
  },

  // ========== QUẢN LÝ NHÂN SỰ (HR Management) ==========
  {
    code: "hr-management",
    labelKey: "sidebar.groups.hrManagement",
    roles: MANAGEMENT_ROLES,
    items: [
      {
        code: "employees",
        labelKey: "sidebar.items.employees",
        icon: Users,
        href: "/dashboard/employees",
        roles: MANAGEMENT_ROLES,
      },
      {
        code: "departments",
        labelKey: "sidebar.items.departments",
        icon: Network,
        href: "/dashboard/departments",
        roles: MANAGEMENT_ROLES,
      },
      {
        code: "team-attendance",
        labelKey: "sidebar.items.attendanceRecords",
        icon: Clock,
        href: "/dashboard/attendance",
        featureCode: "ATTENDANCE",
        roles: MANAGEMENT_ROLES,
      },
      {
        code: "adjustments",
        labelKey: "sidebar.items.adjustments",
        icon: ClipboardList,
        href: "/dashboard/attendance/adjustments",
        featureCode: "ATTENDANCE",
        roles: MANAGEMENT_ROLES,
      },
      {
        code: "team-schedules",
        labelKey: "sidebar.items.schedules",
        icon: CalendarDays,
        href: "/dashboard/schedules/team",
        featureCode: "ATTENDANCE",
        roles: MANAGEMENT_ROLES,
      },
      {
        code: "shifts",
        labelKey: "sidebar.items.shifts",
        icon: CalendarDays,
        href: "/dashboard/schedules/shifts",
        featureCode: "ATTENDANCE",
        roles: MANAGEMENT_ROLES,
      },
      {
        code: "payroll-management",
        labelKey: "sidebar.items.payrollRecords",
        icon: Wallet,
        href: "/dashboard/payroll/management",
        featureCode: "PAYROLL",
        roles: ADMIN_ROLES,
      },
      {
        code: "leave-requests",
        labelKey: "sidebar.items.leaveRequests",
        icon: FileText,
        href: "/dashboard/leave/requests",
        featureCode: "LEAVE",
        roles: MANAGEMENT_ROLES,
      },
      {
        code: "contracts",
        labelKey: "sidebar.items.contracts",
        icon: FileText,
        href: "/dashboard/contracts",
        roles: MANAGEMENT_ROLES,
      },
      {
        code: "reports",
        labelKey: "sidebar.items.reports",
        icon: FileText,
        href: "/dashboard/reports",
        featureCode: "REPORTS",
        roles: MANAGEMENT_ROLES,
      },
    ],
  },

  // ========== CÀI ĐẶT ==========
  {
    code: "settings-group",
    labelKey: "sidebar.groups.settings",
    items: [
      {
        code: "company-profile",
        labelKey: "sidebar.items.company",
        icon: UserCircle,
        href: "/dashboard/profile",
        roles: COMPANY_ROLES,
      },
      {
        code: "wallet",
        labelKey: "sidebar.items.wallet",
        icon: Wallet,
        href: "/dashboard/wallet",
        roles: ADMIN_ROLES,
      },
      {
        code: "settings",
        labelKey: "sidebar.items.settings",
        icon: Settings,
        href: "/dashboard/settings",
        roles: ADMIN_ROLES,
      },
    ],
  },
];

// ============================================================================
// LEGACY: Flat menu items (for backward compatibility)
// ============================================================================

/**
 * @deprecated Use DASHBOARD_MENU_GROUPS instead
 * Giữ lại để tương thích với code cũ
 */
export const DASHBOARD_MENU_ITEMS: MenuItem[] = DASHBOARD_MENU_GROUPS.flatMap(
  (group) => group.items,
);
