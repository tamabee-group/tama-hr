import {
  Home,
  Users,
  Wallet,
  Building2,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import type { SidebarItem } from "../../tamabee/_components/_tamabee-sidebar-items";

export const companySidebarItems: SidebarItem[] = [
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
    title: "Ví tiền",
    url: "/company/wallet",
    icon: <Wallet />,
  },
  {
    title: "Công ty",
    url: "/company/profile",
    icon: <Building2 />,
  },
  {
    title: "Cài đặt",
    url: "/company/settings",
    icon: <Settings />,
  },
];
