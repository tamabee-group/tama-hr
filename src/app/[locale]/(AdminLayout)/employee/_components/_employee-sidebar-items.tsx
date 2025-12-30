"use client";

import { HeadsetIcon, Coins } from "lucide-react";
import { useTranslations } from "next-intl";
import type { SidebarGroup } from "@/types/sidebar";

/**
 * Hook để lấy danh sách menu sidebar cho Employee Company
 * Được nhóm theo: Công việc
 */
export function useEmployeeSidebarGroups(): SidebarGroup[] {
  const t = useTranslations("sidebar");

  return [
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
