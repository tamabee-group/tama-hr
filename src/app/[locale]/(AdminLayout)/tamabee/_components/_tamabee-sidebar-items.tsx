"use client";

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
import { useTranslations } from "next-intl";
import type { SidebarGroup, SidebarSubItem } from "@/types/sidebar";
import type { PermissionKey } from "@/types/permissions";
import { hasPermission } from "@/types/permissions";

/**
 * Hook để lấy danh sách menu sidebar cho Tamabee Admin/Manager
 * Được nhóm theo: Tổng quan, Quản lý, Tài chính, Hệ thống
 * Mỗi item có thể có requiredPermission để kiểm tra quyền truy cập
 */
export function useTamabeeSidebarGroups(): SidebarGroup[] {
  const t = useTranslations("sidebar");

  return [
    {
      label: t("groups.overview"),
      items: [
        {
          title: t("items.home"),
          url: "/",
          icon: <Home />,
        },
      ],
    },
    {
      label: t("groups.management"),
      items: [
        {
          title: t("items.users"),
          url: "/tamabee/users",
          icon: <UsersRound />,
          requiredPermission: "VIEW_USERS",
        },
        {
          title: t("items.customers"),
          url: "/admin/companies",
          icon: <LayoutDashboard />,
          requiredPermission: "VIEW_ALL_COMPANIES",
        },
        {
          title: t("items.plans"),
          url: "/admin/plans",
          icon: <Package />,
          requiredPermission: "SYSTEM_SETTINGS",
        },
      ],
    },
    {
      label: t("groups.finance"),
      items: [
        {
          title: t("items.wallets"),
          url: "/tamabee/wallets",
          icon: <Wallet />,
          requiredPermission: "VIEW_WALLETS",
        },
        {
          title: t("items.deposits"),
          url: "/admin/deposits",
          icon: <Receipt />,
          badgeKey: "pendingDeposits",
          requiredPermission: "DEPOSIT_APPROVAL",
        },
        {
          title: t("items.commissions"),
          url: "/tamabee/commissions",
          icon: <Coins />,
          requiredPermission: "COMMISSION_PAYMENT",
        },
      ],
    },
    {
      label: t("groups.system"),
      items: [
        {
          title: t("items.settings"),
          url: "/tamabee/settings",
          icon: <Settings />,
          requiredPermission: "SYSTEM_SETTINGS",
        },
      ],
    },
  ];
}

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
 * @param groups Danh sách sidebar groups
 * @param role Role của user hiện tại
 * @returns Danh sách sidebar groups đã được filter theo quyền
 */
export function getFilteredSidebarGroups(
  groups: SidebarGroup[],
  role: string,
): SidebarGroup[] {
  return groups
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
