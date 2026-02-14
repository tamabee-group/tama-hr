"use client";

import { useTranslations } from "next-intl";
import {
  Home,
  Calendar,
  Plane,
  Wallet,
  User,
  FileText,
  FolderOpen,
  Clock,
  Coins,
  LayoutDashboard,
  ClipboardCheck,
  Bell,
  LifeBuoy,
  CircleQuestionMark,
  Building,
} from "lucide-react";
import type { SidebarGroup } from "@/types/sidebar";

/**
 * Hook trả về sidebar config cho PersonalLayout
 */
export function useSidebarConfig(
  isTamabeeEmployee: boolean,
  isManager: boolean,
  isTamabeeManager: boolean,
): SidebarGroup[] {
  const t = useTranslations("portal");

  const groups: SidebarGroup[] = [
    {
      label: t("sidebar.main"),
      items: [
        {
          title: t("navigation.home"),
          url: "/me",
          icon: <Home className="h-4 w-4" />,
        },
        {
          title: t("navigation.attendance"),
          url: "/me/attendance",
          icon: <ClipboardCheck className="h-4 w-4" />,
        },
        {
          title: t("navigation.schedule"),
          url: "/me/schedule",
          icon: <Calendar className="h-4 w-4" />,
        },
        {
          title: t("navigation.leave"),
          url: "/me/leave",
          icon: <Plane className="h-4 w-4" />,
        },
      ],
    },
    {
      label: t("sidebar.personal"),
      items: [
        {
          title: t("navigation.payroll"),
          url: "/me/payroll",
          icon: <Wallet className="h-4 w-4" />,
        },
        {
          title: t("navigation.profile"),
          url: "/me/profile",
          icon: <User className="h-4 w-4" />,
        },
        {
          title: t("navigation.contract"),
          url: "/me/contract",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          title: t("navigation.documents"),
          url: "/me/documents",
          icon: <FolderOpen className="h-4 w-4" />,
        },
      ],
    },
    {
      label: t("sidebar.history"),
      items: [
        {
          title: t("navigation.adjustments"),
          url: "/me/adjustments",
          icon: <Clock className="h-4 w-4" />,
        },
        {
          title: t("navigation.notifications"),
          url: "/me/notifications",
          icon: <Bell className="h-4 w-4" />,
        },
        ...(isTamabeeEmployee
          ? [
              {
                title: t("navigation.commissions"),
                url: "/me/commissions",
                icon: <Coins className="h-4 w-4" />,
              },
            ]
          : []),
      ],
    },
    {
      label: t("sidebar.support"),
      items: [
        {
          title: t("navigation.helpCenter"),
          url: "/me/help",
          icon: <CircleQuestionMark className="h-4 w-4" />,
        },
      ],
    },
  ];

  // Nhóm Quản lý - cross-layout navigation
  const managementItems = [];

  if (isManager) {
    managementItems.push({
      title: t("navigation.dashboard"),
      url: "/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    });
  }

  if (isTamabeeManager) {
    managementItems.push({
      title: t("navigation.platformAdmin"),
      url: "/admin/companies",
      icon: <Building className="h-4 w-4" />,
    });
  }

  if (isTamabeeEmployee) {
    managementItems.push({
      title: t("navigation.support"),
      url: "/support",
      icon: <LifeBuoy className="h-4 w-4" />,
    });
  }

  if (managementItems.length > 0) {
    groups.push({
      label: t("sidebar.management"),
      items: managementItems,
    });
  }

  return groups;
}
