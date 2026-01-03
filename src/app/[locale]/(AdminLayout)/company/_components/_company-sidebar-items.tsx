"use client";

import {
  Users,
  Wallet,
  Building2,
  Settings,
  LayoutDashboard,
  Clock,
  DollarSign,
  CalendarDays,
  FileText,
  ClipboardList,
  ClipboardEdit,
  CalendarClock,
  FileSignature,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { SidebarGroup } from "@/types/sidebar";
import { useWorkMode } from "@/hooks/use-work-mode";
import { filterSidebarByWorkMode } from "@/lib/utils/sidebar-work-mode-filter";
import { WorkMode } from "@/types/attendance-config";

/**
 * Lấy danh sách menu sidebar gốc cho Company Admin
 * Cấu trúc đơn giản: Group → Items (không có nested items)
 */
function getBaseSidebarGroups(
  t: ReturnType<typeof useTranslations>,
): SidebarGroup[] {
  return [
    {
      label: t("groups.overview"),
      items: [
        {
          title: t("items.dashboard"),
          url: "/company/dashboard",
          icon: <LayoutDashboard />,
          requiredCompanyPermission: "VIEW_DASHBOARD",
        },
      ],
    },
    {
      label: t("groups.hr"),
      items: [
        {
          title: t("items.employees"),
          url: "/company/employees",
          icon: <Users />,
          requiredCompanyPermission: "VIEW_EMPLOYEES",
        },
        {
          title: t("items.contracts"),
          url: "/company/contracts",
          icon: <FileSignature />,
          requiredCompanyPermission: "MANAGE_CONTRACTS",
        },
        {
          title: t("items.shifts"),
          url: "/company/shifts",
          icon: <CalendarClock />,
          requiredCompanyPermission: "MANAGE_SHIFTS",
        },
        {
          title: t("items.leaveRequests"),
          url: "/company/leave-requests",
          icon: <ClipboardList />,
          requiredCompanyPermission: "MANAGE_LEAVE_REQUESTS",
        },
        {
          title: t("items.holidays"),
          url: "/company/holidays",
          icon: <CalendarDays />,
          requiredCompanyPermission: "MANAGE_HOLIDAYS",
        },
      ],
    },
    {
      label: t("groups.attendancePayroll"),
      items: [
        {
          title: t("items.attendance"),
          url: "/company/attendance",
          icon: <Clock />,
          requiredCompanyPermission: "VIEW_ALL_ATTENDANCE",
        },
        {
          title: t("items.adjustments"),
          url: "/company/adjustments",
          icon: <ClipboardEdit />,
          requiredCompanyPermission: "MANAGE_ADJUSTMENTS",
        },
        {
          title: t("items.payroll"),
          url: "/company/payroll",
          icon: <DollarSign />,
          requiredCompanyPermission: "VIEW_PAYROLL",
        },
      ],
    },
    {
      label: t("groups.finance"),
      items: [
        {
          title: t("items.wallets"),
          url: "/company/wallet",
          icon: <Wallet />,
          requiredCompanyPermission: "VIEW_WALLET",
        },
      ],
    },
    {
      label: t("groups.system"),
      items: [
        {
          title: t("items.reports"),
          url: "/company/reports",
          icon: <FileText />,
          requiredCompanyPermission: "VIEW_REPORTS",
        },
        {
          title: t("items.companyInfo"),
          url: "/company/profile",
          icon: <Building2 />,
          requiredCompanyPermission: "VIEW_COMPANY_PROFILE",
        },
        {
          title: t("items.settings"),
          url: "/company/settings",
          icon: <Settings />,
          requiredCompanyPermission: "MANAGE_SETTINGS",
        },
      ],
    },
  ];
}

/**
 * Hook để lấy danh sách menu sidebar cho Company Admin
 * Tự động filter dựa trên work mode của company
 */
export function useCompanySidebarGroups(): SidebarGroup[] {
  const t = useTranslations("sidebar");
  const { workMode, loading } = useWorkMode();

  const baseGroups = getBaseSidebarGroups(t);

  // Khi đang loading hoặc chưa có work mode, hiển thị tất cả (default FLEXIBLE_SHIFT)
  if (loading || !workMode) {
    return baseGroups;
  }

  // Filter sidebar dựa trên work mode
  return filterSidebarByWorkMode(baseGroups, workMode);
}

/**
 * Hook để lấy work mode hiện tại
 * Export để các component khác có thể sử dụng
 */
export function useCurrentWorkMode(): {
  workMode: WorkMode | null;
  loading: boolean;
  isFixedHours: boolean;
  isFlexibleShift: boolean;
} {
  const { workMode, loading, isFixedHours, isFlexibleShift } = useWorkMode();
  return { workMode, loading, isFixedHours, isFlexibleShift };
}
