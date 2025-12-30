import { Building2, Coins } from "lucide-react";
import type { SidebarGroup } from "@/types/sidebar";

/**
 * Danh sách menu sidebar cho Employee Tamabee
 * Bao gồm: Referrals (công ty đã giới thiệu), Commissions (hoa hồng)
 */
export const employeeTamabeeSidebarGroups: SidebarGroup[] = [
  {
    label: "Quản lý",
    items: [
      {
        title: "Công ty giới thiệu",
        url: "/employee-tamabee/referrals",
        icon: <Building2 />,
      },
      {
        title: "Hoa hồng",
        url: "/employee-tamabee/commissions",
        icon: <Coins />,
      },
    ],
  },
];
