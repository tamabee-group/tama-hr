import {
  Home,
  Search,
  Settings,
  UsersRound,
  LayoutDashboard,
} from "lucide-react";

export const tamabeeSidebarItems = [
  {
    title: "Trang chủ",
    url: "/",
    icon: <Home />,
  },
  {
    title: "Nhân sự",
    url: "#",
    icon: <UsersRound />,
    items: [{ title: "Nhân viên", url: "/tamabee/users" }],
  },
  {
    title: "Khách hàng",
    url: "/tamabee/customers",
    icon: <LayoutDashboard />,
  },
  {
    title: "Tìm kiếm",
    url: "#",
    icon: <Search />,
  },
  {
    title: "Cài đặt",
    url: "#",
    icon: <Settings />,
  },
];

export type SidebarItem = {
  title: string;
  url: string;
  icon: React.ReactNode;
  items?: { title: string; url: string }[];
};
