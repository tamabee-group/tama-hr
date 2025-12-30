import {
  Home,
  Settings,
  UsersRound,
  LayoutDashboard,
  Wallet,
  Receipt,
  Package,
  Coins,
} from "lucide-react";
import type {
  SidebarGroup,
  SidebarItem,
  SidebarSubItem,
} from "@/types/sidebar";
import type { PermissionKey } from "@/types/permissions";
import { hasPermission } from "@/types/permissions";

/**
 * Danh sách menu sidebar cho Tamabee Admin/Manager
 * Được nhóm theo: Tổng quan, Quản lý, Tài chính, Hệ thống
 * Mỗi item có thể có requiredPermission để kiểm tra quyền truy cập
 */
export const tamabeeSidebarGroups: SidebarGroup[] = [
  {
    label: "Tổng quan",
    items: [
      {
        title: "Trang chủ",
        url: "/",
        icon: <Home />,
      },
    ],
  },
  {
    label: "Quản lý",
    items: [
      {
        title: "Nhân sự",
        url: "#",
        icon: <UsersRound />,
        requiredPermission: "VIEW_USERS",
        items: [
          {
            title: "Nhân viên",
            url: "/tamabee/users",
            requiredPermission: "VIEW_USERS",
          },
        ],
      },
      {
        title: "Khách hàng",
        url: "/tamabee/customers",
        icon: <LayoutDashboard />,
        requiredPermission: "VIEW_ALL_COMPANIES",
      },
      {
        title: "Gói dịch vụ",
        url: "/tamabee/plans",
        icon: <Package />,
        requiredPermission: "SYSTEM_SETTINGS",
      },
    ],
  },
  {
    label: "Tài chính",
    items: [
      {
        title: "Ví tiền",
        url: "/tamabee/wallets",
        icon: <Wallet />,
        requiredPermission: "VIEW_WALLETS",
      },
      {
        title: "Nạp tiền",
        url: "/tamabee/deposits",
        icon: <Receipt />,
        badgeKey: "pendingDeposits",
        requiredPermission: "DEPOSIT_APPROVAL",
      },
      {
        title: "Hoa hồng",
        url: "/tamabee/commissions",
        icon: <Coins />,
        requiredPermission: "COMMISSION_PAYMENT",
      },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      {
        title: "Cài đặt",
        url: "/tamabee/settings",
        icon: <Settings />,
        requiredPermission: "SYSTEM_SETTINGS",
      },
    ],
  },
];

/**
 * Filter sub-items dựa trên role của user
 */
function filterSubItems(
  items: SidebarSubItem[] | undefined,
  role: string,
): SidebarSubItem[] | undefined {
  if (!items) return undefined;

  const filtered = items.filter((item) => {
    if (!item.requiredPermission) return true;
    return hasPermission(role, item.requiredPermission);
  });

  return filtered.length > 0 ? filtered : undefined;
}

/**
 * Filter sidebar items dựa trên role của user
 * @param role Role của user hiện tại
 * @returns Danh sách sidebar groups đã được filter theo quyền
 */
export function getFilteredSidebarGroups(role: string): SidebarGroup[] {
  return tamabeeSidebarGroups
    .map((group) => ({
      ...group,
      items: group.items
        .filter((item) => {
          // Nếu không có requiredPermission, cho phép tất cả
          if (!item.requiredPermission) return true;
          return hasPermission(role, item.requiredPermission);
        })
        .map((item) => ({
          ...item,
          items: filterSubItems(item.items, role),
        })),
    }))
    .filter((group) => group.items.length > 0);
}

/**
 * Kiểm tra item có yêu cầu Admin permission không
 * Dùng để hiển thị visual indicator cho Admin-only features
 */
export function isAdminOnlyPermission(permission?: PermissionKey): boolean {
  if (!permission) return false;
  // Các permission chỉ Admin mới có
  const adminOnlyPermissions: PermissionKey[] = [
    "DIRECT_WALLET_MANIPULATION",
    "SYSTEM_SETTINGS",
    "MANAGE_USERS",
  ];
  return adminOnlyPermissions.includes(permission);
}
