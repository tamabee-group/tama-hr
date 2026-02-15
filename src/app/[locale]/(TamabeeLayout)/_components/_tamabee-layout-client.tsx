"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BaseSidebar } from "@/app/[locale]/_components/_base/base-sidebar";
import { SidebarLogo } from "@/app/[locale]/_components/_logo";
import { useAuth } from "@/hooks/use-auth";
import { ADMIN_MENU_ITEMS, type MenuItem } from "@/constants/menu-items";
import { filterMenuItems } from "@/lib/utils/filter-menu-items";
import { useAdminPendingCounts } from "@/hooks/use-admin-pending-counts";
import type {
  SidebarGroup,
  SidebarHeaderConfig,
  SidebarItem,
} from "@/types/sidebar";
import {
  DesktopHeader,
  MobileHeader,
  type HeaderConfig,
} from "@/app/[locale]/_components/_base/_layout-header";
import { LifeBuoy, User } from "lucide-react";

/**
 * Chuyển đổi MenuItem sang SidebarItem format (hỗ trợ children)
 */
function convertMenuItem(
  item: MenuItem,
  t: ReturnType<typeof useTranslations>,
  badgeCounts?: Record<string, number>,
): SidebarItem {
  const sidebarItem: SidebarItem = {
    title: t(item.labelKey),
    url: item.href,
    icon: <item.icon className="h-4 w-4" />,
    badgeCount: badgeCounts?.[item.code],
  };

  // Chuyển đổi children thành sub-items
  if (item.children && item.children.length > 0) {
    sidebarItem.items = item.children.map((child) => ({
      title: t(child.labelKey),
      url: child.href,
    }));
  }

  return sidebarItem;
}

/**
 * Chuyển đổi MenuItem[] sang SidebarGroup[] format
 */
function convertToSidebarGroups(
  items: MenuItem[],
  t: ReturnType<typeof useTranslations>,
  badgeCounts?: Record<string, number>,
): SidebarGroup[] {
  // Nhóm items theo category
  const platformItems = items.filter((item) =>
    ["dashboard", "users", "customers", "companies", "plans"].includes(
      item.code,
    ),
  );
  const financeItems = items.filter((item) =>
    ["wallets", "deposits", "commissions"].includes(item.code),
  );
  const systemItems = items.filter((item) =>
    ["system", "settings", "system-notifications", "feedbacks"].includes(
      item.code,
    ),
  );

  const groups: SidebarGroup[] = [];

  if (platformItems.length > 0) {
    groups.push({
      label: t("sidebar.groups.management"),
      items: platformItems.map((item) => convertMenuItem(item, t, badgeCounts)),
    });
  }

  if (financeItems.length > 0) {
    groups.push({
      label: t("sidebar.groups.finance"),
      items: financeItems.map((item) => convertMenuItem(item, t, badgeCounts)),
    });
  }

  if (systemItems.length > 0) {
    groups.push({
      label: t("sidebar.groups.system"),
      items: systemItems.map((item) => convertMenuItem(item, t, badgeCounts)),
    });
  }

  // Cross-layout navigation - gom vào cuối
  groups.push({
    label: t("sidebar.groups.personal"),
    items: [
      {
        title: t("sidebar.items.customerSupport"),
        url: "/support",
        icon: <LifeBuoy className="h-4 w-4" />,
      },
      {
        title: t("sidebar.items.myPortal"),
        url: "/me",
        icon: <User className="h-4 w-4" />,
      },
    ],
  });

  return groups;
}

/**
 * Header config cho Tamabee Admin
 */
const tamabeeHeaderConfig: SidebarHeaderConfig = {
  logo: <SidebarLogo size={32} />,
  name: "TAMABEE",
  fallback: "TM",
};

/**
 * Header config cho shared Layout_Header
 */
const headerConfig: HeaderConfig = {
  namespace: "admin",
  mainPages: {
    "/admin": "dashboard.title",
    "/admin/companies": "companies.title",
    "/admin/deposits": "deposits.title",
    "/admin/plans": "plans.title",
    "/admin/settings": "settings.title",
    "/admin/system": "schedulers.title",
    "/admin/system-notifications": "systemNotifications.title",
    "/admin/feedbacks": "feedbacks.title",
  },
  subPageTitles: {
    "/admin/system/payroll": "schedulers.subPages.payroll",
    "/admin/system/billing": "schedulers.subPages.billing",
    "/admin/system/contracts": "schedulers.subPages.contracts",
    "/admin/system/cleanup": "schedulers.subPages.cleanup",
    "/admin/system/tenants": "schedulers.subPages.tenants",
    "/admin/system-notifications/": "systemNotifications.title",
    "/admin/feedbacks/": "feedbacks.title",
  },
  helpMapping: {
    "/admin/companies": {
      topic: "platform_admin",
      article: "manage_companies",
    },
    "/admin/deposits": {
      topic: "platform_admin",
      article: "deposit_management",
    },
    "/admin/plans": { topic: "platform_admin", article: "plan_management" },
  },
};

/**
 * TamabeeLayoutClient - Client wrapper cho TamabeeLayout
 * Xử lý authentication và client-side logic
 */
export function TamabeeLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, status } = useAuth();
  const t = useTranslations();
  const adminCounts = useAdminPendingCounts();

  // Kiểm tra quyền truy cập
  useEffect(() => {
    if (status === "loading") return;

    if (!user) {
      router.replace("/login");
      return;
    }

    // Chỉ ADMIN_TAMABEE và MANAGER_TAMABEE mới được truy cập
    const allowedRoles = ["ADMIN_TAMABEE", "MANAGER_TAMABEE"];
    if (!allowedRoles.includes(user.role)) {
      router.replace("/unauthorized");
      return;
    }
  }, [user, status, router]);

  // Loading state
  if (status === "loading" || !user) {
    return null;
  }

  // Không render nếu không có quyền
  const allowedRoles = ["ADMIN_TAMABEE", "MANAGER_TAMABEE"];
  if (!allowedRoles.includes(user.role)) {
    return null;
  }

  // Filter menu items theo role
  const filteredItems = filterMenuItems(ADMIN_MENU_ITEMS, user.role);
  const badgeCounts: Record<string, number> = {
    deposits: adminCounts.pendingDeposits,
    feedbacks: adminCounts.openFeedbacks,
  };
  const sidebarGroups = convertToSidebarGroups(filteredItems, t, badgeCounts);

  return (
    <div className="flex flex-col justify-center">
      <SidebarProvider>
        <BaseSidebar
          groups={sidebarGroups}
          headerConfig={tamabeeHeaderConfig}
          userRole={user.role}
        />
        <main className="w-full">
          <DesktopHeader config={headerConfig} />
          <MobileHeader />
          <div className="p-4 pb-20 md:pb-4">{children}</div>
        </main>
      </SidebarProvider>
    </div>
  );
}
