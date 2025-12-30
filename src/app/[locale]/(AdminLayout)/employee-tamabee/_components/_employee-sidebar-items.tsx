"use client";

import { Building2, Coins } from "lucide-react";
import { useTranslations } from "next-intl";
import type { SidebarGroup } from "@/types/sidebar";

/**
 * Hook để lấy danh sách menu sidebar cho Employee Tamabee
 * Bao gồm: Referrals (công ty đã giới thiệu), Commissions (hoa hồng)
 */
export function useEmployeeTamabeeSidebarGroups(): SidebarGroup[] {
  const t = useTranslations("sidebar");

  return [
    {
      label: t("groups.management"),
      items: [
        {
          title: t("items.referrals"),
          url: "/employee-tamabee/referrals",
          icon: <Building2 />,
        },
        {
          title: t("items.commissions"),
          url: "/employee-tamabee/commissions",
          icon: <Coins />,
        },
      ],
    },
  ];
}
