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
  CalendarCheck,
  FileText,
  UserCircle,
  Receipt,
  ClipboardList,
  Network,
  User,
  Wrench,
  Server,
  Bell,
  MessageSquare,
  LifeBuoy,
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
    code: "plans",
    labelKey: "sidebar.items.plans",
    icon: Package,
    href: "/admin/plans",
    roles: ["ADMIN_TAMABEE"],
  },
  {
    code: "system",
    labelKey: "sidebar.items.systemAdmin",
    icon: Server,
    href: "/admin/system",
    roles: ["ADMIN_TAMABEE"],
    children: [
      {
        code: "system-schedulers",
        labelKey: "sidebar.items.schedulers",
        icon: Clock,
        href: "/admin/system",
      },
      {
        code: "system-payroll",
        labelKey: "sidebar.items.payrollScheduler",
        icon: Wallet,
        href: "/admin/system/payroll",
      },
      {
        code: "system-billing",
        labelKey: "sidebar.items.billing",
        icon: Wallet,
        href: "/admin/system/billing",
      },
      {
        code: "system-contracts",
        labelKey: "sidebar.items.contractExpiry",
        icon: FileText,
        href: "/admin/system/contracts",
      },
      {
        code: "system-cleanup",
        labelKey: "sidebar.items.companyCleanup",
        icon: Building,
        href: "/admin/system/cleanup",
      },
      {
        code: "system-tenants",
        labelKey: "sidebar.items.tenantCleanup",
        icon: Wrench,
        href: "/admin/system/tenants",
      },
    ],
  },
  {
    code: "system-notifications",
    labelKey: "sidebar.items.systemNotifications",
    icon: Bell,
    href: "/admin/system-notifications",
  },
  {
    code: "feedbacks",
    labelKey: "sidebar.items.feedbacks",
    icon: MessageSquare,
    href: "/admin/feedbacks",
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
// SUPPORT MENU (SupportLayout - /support/*)
// Dành cho EMPLOYEE_TAMABEE - hỗ trợ khách hàng
// ============================================================================

export const SUPPORT_MENU_ITEMS: MenuItem[] = [
  {
    code: "support-home",
    labelKey: "navigation.home",
    icon: LayoutDashboard,
    href: "/support",
  },
  {
    code: "support-referrals",
    labelKey: "navigation.referrals",
    icon: Building,
    href: "/support/referrals",
  },
  {
    code: "support-commissions",
    labelKey: "navigation.commissions",
    icon: Receipt,
    href: "/support/commissions",
  },
  {
    code: "support-feedbacks",
    labelKey: "navigation.feedbacks",
    icon: MessageSquare,
    href: "/support/feedbacks",
  },
];

// ============================================================================
// PERSONAL MENU (PersonalLayout - /me/*)
// ============================================================================

/**
 * Menu items cho PersonalLayout
 * Dành cho tất cả users xem thông tin cá nhân
 */
export const PERSONAL_MENU_ITEMS: MenuItem[] = [
  {
    code: "my-attendance",
    labelKey: "sidebar.items.myAttendance",
    icon: Clock,
    href: "/me",
  },
  {
    code: "my-schedule",
    labelKey: "sidebar.items.mySchedule",
    icon: CalendarDays,
    href: "/me/schedule",
  },
  {
    code: "my-adjustments",
    labelKey: "sidebar.items.myAdjustments",
    icon: ClipboardList,
    href: "/me/adjustments",
  },
  {
    code: "my-leave",
    labelKey: "sidebar.items.myLeave",
    icon: FileText,
    href: "/me/leave",
  },
  {
    code: "my-payslip",
    labelKey: "sidebar.items.myPayroll",
    icon: Wallet,
    href: "/me/payroll",
  },
  {
    code: "my-commissions",
    labelKey: "sidebar.items.myCommissions",
    icon: Receipt,
    href: "/me/commissions",
    roles: ["EMPLOYEE_TAMABEE"],
  },
];

// ============================================================================
// DASHBOARD MENU GROUPS (DashboardLayout - /dashboard/*)
// ============================================================================

/**
 * Menu groups cho Dashboard
 * Chia thành: Tổng quan, Quản lý nhân sự, Cài đặt
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
    ],
  },

  // ========== NHÂN SỰ ==========
  {
    code: "hr-group",
    labelKey: "sidebar.groups.hr",
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
        code: "contracts",
        labelKey: "sidebar.items.contracts",
        icon: FileText,
        href: "/dashboard/contracts",
        roles: MANAGEMENT_ROLES,
      },
    ],
  },

  // ========== CHẤM CÔNG & LỊCH ==========
  {
    code: "attendance-group",
    labelKey: "sidebar.groups.attendance",
    roles: MANAGEMENT_ROLES,
    items: [
      {
        code: "team-attendance",
        labelKey: "sidebar.items.attendanceRecords",
        icon: Clock,
        href: "/dashboard/attendance",
        roles: MANAGEMENT_ROLES,
      },
      {
        code: "adjustments",
        labelKey: "sidebar.items.adjustments",
        icon: ClipboardList,
        href: "/dashboard/adjustments",
        roles: MANAGEMENT_ROLES,
      },
      {
        code: "shifts",
        labelKey: "sidebar.items.shifts",
        icon: CalendarDays,
        href: "/dashboard/shifts",
        roles: MANAGEMENT_ROLES,
      },
    ],
  },

  // ========== LƯƠNG & NGHỈ PHÉP ==========
  {
    code: "payroll-leave-group",
    labelKey: "sidebar.groups.payrollLeave",
    roles: MANAGEMENT_ROLES,
    items: [
      {
        code: "payroll-management",
        labelKey: "sidebar.items.payrollRecords",
        icon: Wallet,
        href: "/dashboard/payroll",
        roles: MANAGEMENT_ROLES,
      },
      {
        code: "leave-requests",
        labelKey: "sidebar.items.leaveRequests",
        icon: FileText,
        href: "/dashboard/leaves",
        roles: MANAGEMENT_ROLES,
      },
      {
        code: "leave-balances",
        labelKey: "sidebar.items.leaveBalances",
        icon: CalendarDays,
        href: "/dashboard/leave-balances",
        roles: MANAGEMENT_ROLES,
      },
      {
        code: "holidays",
        labelKey: "sidebar.items.holidays",
        icon: CalendarCheck,
        href: "/dashboard/holidays",
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
        roles: [...COMPANY_ROLES, "ADMIN_TAMABEE", "MANAGER_TAMABEE"],
      },
      {
        code: "wallet",
        labelKey: "sidebar.items.wallet",
        icon: Wallet,
        href: "/dashboard/wallet",
        roles: ["ADMIN_COMPANY"],
      },
      {
        code: "settings",
        labelKey: "sidebar.items.companySettings",
        icon: Wrench,
        href: "/dashboard/settings",
        roles: ADMIN_ROLES,
      },
    ],
  },

  // ========== QUẢN LÝ (cross-layout navigation) ==========
  {
    code: "management-group",
    labelKey: "sidebar.groups.management",
    items: [
      {
        code: "platform-admin",
        labelKey: "sidebar.items.platformAdmin",
        icon: Building,
        href: "/admin/companies",
        roles: ["ADMIN_TAMABEE", "MANAGER_TAMABEE"],
      },
      {
        code: "customer-support",
        labelKey: "sidebar.items.customerSupport",
        icon: LifeBuoy,
        href: "/support",
        roles: ["ADMIN_TAMABEE", "MANAGER_TAMABEE"],
      },
      {
        code: "my-portal",
        labelKey: "sidebar.items.myPortal",
        icon: User,
        href: "/me",
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
