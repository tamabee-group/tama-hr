import { HeadsetIcon, Coins } from "lucide-react";
import type { SidebarGroup } from "@/types/sidebar";

/**
 * Danh sách menu sidebar cho Employee Tamabee
 * Được nhóm theo: Công việc
 */
export const employeeSidebarGroups: SidebarGroup[] = [
  {
    label: "Công việc",
    items: [
      {
        title: "Hỗ trợ",
        url: "/employee/support",
        icon: <HeadsetIcon />,
      },
      {
        title: "Hoa hồng của tôi",
        url: "/employee/commissions",
        icon: <Coins />,
      },
    ],
  },
];
