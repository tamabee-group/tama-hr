import {
  Home,
  Users,
  Wallet,
  Building2,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import type { SidebarGroup } from "@/types/sidebar";

/**
 * Danh sách menu sidebar cho Company Admin
 * Được nhóm theo: Tổng quan, Quản lý, Tài chính, Hệ thống
 */
export const companySidebarGroups: SidebarGroup[] = [
  {
    label: "Tổng quan",
    items: [
      {
        title: "Trang chủ",
        url: "/",
        icon: <Home />,
      },
      {
        title: "Dashboard",
        url: "/company/dashboard",
        icon: <LayoutDashboard />,
      },
    ],
  },
  {
    label: "Quản lý",
    items: [
      {
        title: "Nhân viên",
        url: "#",
        icon: <Users />,
        items: [
          { title: "Danh sách", url: "/company/employees" },
          { title: "Thêm mới", url: "/company/employees/create" },
        ],
      },
      {
        title: "Công ty",
        url: "/company/profile",
        icon: <Building2 />,
      },
    ],
  },
  {
    label: "Tài chính",
    items: [
      {
        title: "Ví tiền",
        url: "#",
        icon: <Wallet />,
        items: [
          { title: "Tổng quan", url: "/company/wallet" },
          { title: "Nạp tiền", url: "/company/wallet/deposits" },
        ],
      },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      {
        title: "Cài đặt",
        url: "/company/settings",
        icon: <Settings />,
      },
    ],
  },
];
