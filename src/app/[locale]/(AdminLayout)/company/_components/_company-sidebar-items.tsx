"use client";

import {
  Users,
  Wallet,
  Building2,
  Settings,
  LayoutDashboard,
  Clock,
  Calendar,
  DollarSign,
  CalendarDays,
  FileText,
  ClipboardList,
  ClipboardEdit,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { SidebarGroup } from "@/types/sidebar";

/**
 * Hook để lấy danh sách menu sidebar cho Company Admin
 * Cấu trúc đơn giản: Group → Items (không có nested items)
 */
export function useCompanySidebarGroups(): SidebarGroup[] {
  const t = useTranslations("sidebar");

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
          title: t("items.schedules"),
          url: "/company/schedules",
          icon: <Calendar />,
          requiredCompanyPermission: "VIEW_SCHEDULES",
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
