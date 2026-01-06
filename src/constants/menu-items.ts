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
  Coins,
  UsersRound,
} from "lucide-react";
import type { UserRole } from "@/types/enums";

/**
 * Interface cho menu item trong sidebar
 * Hỗ trợ filtering theo plan features và user roles
 */
export interface MenuItem {
  /** Unique code cho menu item */
  code: string;
  /** i18n key cho label */
  labelKey: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** URL path */
  href: string;
  /** Feature code để check plan (optional) */
  featureCode?: string;
  /** Roles được phép xem item này (optional - nếu không có thì tất cả roles đều thấy) */
  roles?: UserRole[];
  /** Nested children items */
  children?: MenuItem[];
  /** Badge key để hiển thị count */
  badgeKey?: string;
}

/**
 * Roles có quyền quản lý (Admin và Manager của cả Tamabee và Company)
 */
const MANAGEMENT_ROLES: UserRole[] = [
  "ADMIN_TAMABEE",
  "MANAGER_TAMABEE",
  "ADMIN_COMPANY",
  "MANAGER_COMPANY",
];

/**
 * Roles Admin (chỉ Admin của Tamabee và Company)
 */
const ADMIN_ROLES: UserRole[] = ["ADMIN_TAMABEE", "ADMIN_COMPANY"];

/**
 * ADMIN_MENU_ITEMS - Menu cho platform management (Tamabee admin only)
 * Sử dụng trong TamabeeLayout cho /admin/* routes
 */
export const ADMIN_MENU_ITEMS: MenuItem[] = [
  {
    code: "companies",
    labelKey: "sidebar.items.customers",
    icon: Building,
    href: "/admin/companies",
  },
  {
    code: "plans",
    labelKey: "sidebar.items.plans",
    icon: Package,
    href: "/admin/plans",
    roles: ["ADMIN_TAMABEE"],
  },
  {
    code: "deposits",
    labelKey: "sidebar.items.deposits",
    icon: Receipt,
    href: "/admin/deposits",
    badgeKey: "pendingDeposits",
  },
  {
    code: "wallets",
    labelKey: "sidebar.items.wallets",
    icon: Wallet,
    href: "/tamabee/wallets",
  },
  {
    code: "users",
    labelKey: "sidebar.items.users",
    icon: UsersRound,
    href: "/tamabee/users",
  },
  {
    code: "commissions",
    labelKey: "sidebar.items.commissions",
    icon: Coins,
    href: "/tamabee/commissions",
  },
  {
    code: "settings",
    labelKey: "sidebar.items.settings",
    icon: Settings,
    href: "/tamabee/settings",
    roles: ["ADMIN_TAMABEE"],
  },
];

/**
 * DASHBOARD_MENU_ITEMS - Menu cho HR features (tất cả users)
 * Sử dụng trong DashboardLayout cho /dashboard/* routes
 */
export const DASHBOARD_MENU_ITEMS: MenuItem[] = [
  {
    code: "dashboard",
    labelKey: "sidebar.items.dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    code: "attendance",
    labelKey: "sidebar.items.attendance",
    icon: Clock,
    href: "/dashboard/attendance",
    featureCode: "ATTENDANCE",
    children: [
      {
        code: "my-attendance",
        labelKey: "sidebar.items.myAttendance",
        icon: Clock,
        href: "/dashboard/attendance/me",
      },
      {
        code: "team-attendance",
        labelKey: "sidebar.items.attendanceRecords",
        icon: Clock,
        href: "/dashboard/attendance/team",
        roles: MANAGEMENT_ROLES,
      },
      {
        code: "adjustments",
        labelKey: "sidebar.items.adjustments",
        icon: Clock,
        href: "/dashboard/attendance/adjustments",
        roles: MANAGEMENT_ROLES,
      },
    ],
  },
  {
    code: "schedules",
    labelKey: "sidebar.items.schedules",
    icon: CalendarDays,
    href: "/dashboard/schedules",
    featureCode: "ATTENDANCE",
    children: [
      {
        code: "my-schedule",
        labelKey: "sidebar.items.mySchedule",
        icon: CalendarDays,
        href: "/dashboard/schedules/me",
      },
      {
        code: "team-schedules",
        labelKey: "sidebar.items.schedules",
        icon: CalendarDays,
        href: "/dashboard/schedules/team",
        roles: MANAGEMENT_ROLES,
      },
      {
        code: "shifts",
        labelKey: "sidebar.items.shifts",
        icon: CalendarDays,
        href: "/dashboard/schedules/shifts",
        roles: MANAGEMENT_ROLES,
      },
    ],
  },
  {
    code: "payroll",
    labelKey: "sidebar.items.payroll",
    icon: Wallet,
    href: "/dashboard/payroll",
    featureCode: "PAYROLL",
    children: [
      {
        code: "my-payslip",
        labelKey: "sidebar.items.myPayroll",
        icon: Wallet,
        href: "/dashboard/payroll/me",
      },
      {
        code: "payroll-management",
        labelKey: "sidebar.items.payrollRecords",
        icon: Wallet,
        href: "/dashboard/payroll/management",
        roles: ADMIN_ROLES,
      },
    ],
  },
  {
    code: "leave",
    labelKey: "sidebar.items.leave",
    icon: FileText,
    href: "/dashboard/leave",
    featureCode: "LEAVE",
    children: [
      {
        code: "my-leave",
        labelKey: "sidebar.items.myLeave",
        icon: FileText,
        href: "/dashboard/leave/me",
      },
      {
        code: "leave-requests",
        labelKey: "sidebar.items.leaveRequests",
        icon: FileText,
        href: "/dashboard/leave/requests",
        roles: MANAGEMENT_ROLES,
      },
    ],
  },
  {
    code: "employees",
    labelKey: "sidebar.items.employees",
    icon: Users,
    href: "/dashboard/employees",
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
  {
    code: "settings",
    labelKey: "sidebar.items.settings",
    icon: Settings,
    href: "/dashboard/settings",
    roles: ADMIN_ROLES,
  },
  {
    code: "profile",
    labelKey: "sidebar.items.company",
    icon: UserCircle,
    href: "/dashboard/profile",
  },
];
