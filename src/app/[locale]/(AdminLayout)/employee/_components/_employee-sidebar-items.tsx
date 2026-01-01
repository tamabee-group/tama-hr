"use client";

import {
  HeadsetIcon,
  Coins,
  Clock,
  Calendar,
  DollarSign,
  CalendarDays,
  ClipboardEdit,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { SidebarGroup } from "@/types/sidebar";
import type { MobileNavItem } from "@/app/[locale]/_components/_shared/_mobile-bottom-nav";

/**
 * Hook để lấy danh sách menu sidebar cho Employee Company
 * Được nhóm theo: Chấm công, Công việc
 */
export function useEmployeeSidebarGroups(): SidebarGroup[] {
  const t = useTranslations("sidebar");

  return [
    {
      label: t("groups.attendance"),
      items: [
        {
          title: t("items.myAttendance"),
          url: "/employee/attendance",
          icon: <Clock />,
        },
        {
          title: t("items.adjustments"),
          url: "/employee/adjustments",
          icon: <ClipboardEdit />,
        },
        {
          title: t("items.mySchedule"),
          url: "/employee/schedule",
          icon: <Calendar />,
        },
        {
          title: t("items.myPayroll"),
          url: "/employee/payroll",
          icon: <DollarSign />,
        },
        {
          title: t("items.myLeave"),
          url: "/employee/leave",
          icon: <CalendarDays />,
        },
      ],
    },
    {
      label: t("groups.work"),
      items: [
        {
          title: t("items.support"),
          url: "/employee/support",
          icon: <HeadsetIcon />,
        },
        {
          title: t("items.myCommissions"),
          url: "/employee/commissions",
          icon: <Coins />,
        },
      ],
    },
  ];
}

/**
 * Hook để lấy danh sách mobile bottom navigation items cho Employee
 * Chỉ hiển thị các key actions quan trọng nhất (max 5 items)
 */
export function useEmployeeMobileNavItems(): MobileNavItem[] {
  const t = useTranslations("sidebar");

  return [
    {
      title: t("items.myAttendance"),
      url: "/employee/attendance",
      icon: <Clock />,
      activePatterns: ["/employee/attendance"],
    },
    {
      title: t("items.mySchedule"),
      url: "/employee/schedule",
      icon: <Calendar />,
      activePatterns: ["/employee/schedule"],
    },
    {
      title: t("items.myPayroll"),
      url: "/employee/payroll",
      icon: <DollarSign />,
      activePatterns: ["/employee/payroll"],
    },
    {
      title: t("items.myLeave"),
      url: "/employee/leave",
      icon: <CalendarDays />,
      activePatterns: ["/employee/leave"],
    },
  ];
}
