import { LucideIcon } from "lucide-react";
import {
  Clock,
  CalendarDays,
  Wallet,
  Users,
  Settings,
  Shield,
  UserCircle,
  Coffee,
  Route,
  CalendarClock,
} from "lucide-react";

// ============================================
// Types
// ============================================

export type RoleGroup = "employee" | "company_admin" | "tamabee_staff";

export interface HelpArticle {
  key: string;
  roles: RoleGroup[];
}

export interface HelpTopic {
  key: string;
  icon: LucideIcon;
  roles: RoleGroup[];
  articles: HelpArticle[];
}

// ============================================
// Role Hierarchy: employee ⊂ company_admin ⊂ tamabee_staff
// ============================================

const ROLE_HIERARCHY: Record<RoleGroup, RoleGroup[]> = {
  employee: ["employee"],
  company_admin: ["employee", "company_admin"],
  tamabee_staff: ["employee", "company_admin", "tamabee_staff"],
};

/**
 * Chuyển đổi UserRole sang RoleGroup
 */
export function toRoleGroup(role: string | undefined): RoleGroup {
  if (!role) return "employee";
  if (role.includes("TAMABEE")) return "tamabee_staff";
  if (role === "ADMIN_COMPANY" || role === "MANAGER_COMPANY")
    return "company_admin";
  return "employee";
}

/**
 * Lọc topics theo role — chỉ trả về topics và articles mà user có quyền xem
 */
export function filterByRole(
  topics: HelpTopic[],
  userRole: RoleGroup,
): HelpTopic[] {
  const allowedRoles = ROLE_HIERARCHY[userRole] || ROLE_HIERARCHY.employee;

  return topics
    .filter((topic) => topic.roles.some((r) => allowedRoles.includes(r)))
    .map((topic) => ({
      ...topic,
      articles: topic.articles.filter((article) =>
        article.roles.some((r) => allowedRoles.includes(r)),
      ),
    }))
    .filter((topic) => topic.articles.length > 0);
}

// ============================================
// Help Topics & Articles
// ============================================

export const HELP_TOPICS: HelpTopic[] = [
  // Luồng hoạt động hệ thống - cho Admin
  {
    key: "system_workflow",
    icon: Route,
    roles: ["company_admin"],
    articles: [
      { key: "overview", roles: ["company_admin"] },
      { key: "setup_steps", roles: ["company_admin"] },
      { key: "employee_onboarding", roles: ["company_admin"] },
      { key: "daily_operations", roles: ["company_admin"] },
      { key: "monthly_payroll_flow", roles: ["company_admin"] },
      { key: "common_errors", roles: ["company_admin"] },
    ],
  },
  {
    key: "attendance",
    icon: Clock,
    roles: ["employee"],
    articles: [
      { key: "how_to_checkin", roles: ["employee"] },
      { key: "multi_shift", roles: ["employee"] },
      { key: "view_history", roles: ["employee"] },
      { key: "request_adjustment", roles: ["employee"] },
      { key: "geolocation", roles: ["employee"] },
      { key: "rounding_rules", roles: ["employee"] },
    ],
  },
  // Giải lao - cho Employee
  {
    key: "breaks",
    icon: Coffee,
    roles: ["employee"],
    articles: [
      { key: "how_breaks_work", roles: ["employee"] },
      { key: "start_end_break", roles: ["employee"] },
      { key: "break_types", roles: ["employee"] },
      { key: "break_compliance", roles: ["employee"] },
      { key: "break_adjustment", roles: ["employee"] },
    ],
  },
  {
    key: "leave",
    icon: CalendarDays,
    roles: ["employee"],
    articles: [
      { key: "request_leave", roles: ["employee"] },
      { key: "leave_types", roles: ["employee"] },
      { key: "check_balance", roles: ["employee"] },
      { key: "cancel_leave", roles: ["employee"] },
    ],
  },
  // Ca làm việc - cho Employee (xem lịch, đổi ca) và Admin (quản lý ca)
  {
    key: "shifts",
    icon: CalendarClock,
    roles: ["employee"],
    articles: [
      { key: "overview", roles: ["employee"] },
      { key: "view_schedule", roles: ["employee"] },
      { key: "swap_request", roles: ["employee"] },
      { key: "manage_templates", roles: ["company_admin"] },
      { key: "assign_shifts", roles: ["company_admin"] },
      { key: "approve_swaps", roles: ["company_admin"] },
    ],
  },
  {
    key: "payroll",
    icon: Wallet,
    roles: ["employee"],
    articles: [
      { key: "view_payslip", roles: ["employee"] },
      { key: "salary_components", roles: ["employee"] },
      { key: "overtime_calculation", roles: ["employee"] },
      { key: "break_deduction", roles: ["employee"] },
    ],
  },
  {
    key: "profile",
    icon: UserCircle,
    roles: ["employee"],
    articles: [
      { key: "update_profile", roles: ["employee"] },
      { key: "change_language", roles: ["employee"] },
      { key: "bank_info", roles: ["employee"] },
    ],
  },
  {
    key: "employee_management",
    icon: Users,
    roles: ["company_admin"],
    articles: [
      { key: "create_employee", roles: ["company_admin"] },
      { key: "contract_setup", roles: ["company_admin"] },
      { key: "salary_config", roles: ["company_admin"] },
      { key: "allowance_deduction", roles: ["company_admin"] },
      { key: "manage_attendance", roles: ["company_admin"] },
      { key: "approve_leave", roles: ["company_admin"] },
      { key: "manage_payroll", roles: ["company_admin"] },
    ],
  },
  {
    key: "company_settings",
    icon: Settings,
    roles: ["company_admin"],
    articles: [
      { key: "attendance_settings", roles: ["company_admin"] },
      { key: "break_settings", roles: ["company_admin"] },
      { key: "overtime_settings", roles: ["company_admin"] },
      { key: "payroll_settings", roles: ["company_admin"] },
      { key: "department_settings", roles: ["company_admin"] },
    ],
  },
  {
    key: "platform_admin",
    icon: Shield,
    roles: ["tamabee_staff"],
    articles: [
      { key: "manage_companies", roles: ["tamabee_staff"] },
      { key: "deposit_management", roles: ["tamabee_staff"] },
      { key: "plan_management", roles: ["tamabee_staff"] },
    ],
  },
];
