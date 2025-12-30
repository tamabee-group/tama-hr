"use client";

import {
  Home,
  Users,
  Wallet,
  Building2,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { SidebarGroup } from "@/types/sidebar";

/**
 * Hook để lấy danh sách menu sidebar cho Company Admin
 * Được nhóm theo: Tổng quan, Quản lý, Tài chính, Hệ thống
 */
export function useCompanySidebarGroups(): SidebarGroup[] {
  const t = useTranslations("sidebar");
  const tCommon = useTranslations("common");

  return [
    {
      label: t("groups.overview"),
      items: [
        {
          title: t("items.home"),
          url: "/",
          icon: <Home />,
        },
        {
          title: t("items.dashboard"),
          url: "/company/dashboard",
          icon: <LayoutDashboard />,
        },
      ],
    },
    {
      label: t("groups.management"),
      items: [
        {
          title: t("items.employees"),
          url: "#",
          icon: <Users />,
          items: [
            { title: tCommon("all"), url: "/company/employees" },
            { title: tCommon("add"), url: "/company/employees/create" },
          ],
        },
        {
          title: t("items.companyInfo"),
          url: "/company/profile",
          icon: <Building2 />,
        },
      ],
    },
    {
      label: t("groups.finance"),
      items: [
        {
          title: t("items.wallets"),
          url: "#",
          icon: <Wallet />,
          items: [
            { title: tCommon("all"), url: "/company/wallet" },
            { title: t("items.deposits"), url: "/company/wallet/deposits" },
          ],
        },
      ],
    },
    {
      label: t("groups.system"),
      items: [
        {
          title: t("items.settings"),
          url: "/company/settings",
          icon: <Settings />,
        },
      ],
    },
  ];
}
