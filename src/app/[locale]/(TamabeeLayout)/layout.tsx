"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ToggleTheme } from "@/app/[locale]/_components/_toggle-theme";
import { BreadcrumbRouter } from "@/app/[locale]/(AdminLayout)/_components/_breadcrumb-router";
import { BaseSidebar } from "@/app/[locale]/_components/_base/base-sidebar";
import { SidebarLogo } from "@/app/[locale]/_components/_logo";
import { useAuth } from "@/hooks/use-auth";
import { usePendingDepositsCount } from "@/hooks/use-pending-deposits-count";
import { ADMIN_MENU_ITEMS, type MenuItem } from "@/constants/menu-items";
import { filterMenuItems } from "@/lib/utils/filter-menu-items";
import type { SidebarGroup, SidebarHeaderConfig } from "@/types/sidebar";

/**
 * Chuyển đổi MenuItem[] sang SidebarGroup[] format
 */
function convertToSidebarGroups(
  items: MenuItem[],
  t: ReturnType<typeof useTranslations>,
): SidebarGroup[] {
  // Nhóm items theo category
  const platformItems = items.filter((item) =>
    ["dashboard", "users", "customers", "plans"].includes(item.code),
  );
  const financeItems = items.filter((item) =>
    ["wallets", "deposits", "commissions"].includes(item.code),
  );
  const systemItems = items.filter((item) => ["settings"].includes(item.code));

  const groups: SidebarGroup[] = [];

  if (platformItems.length > 0) {
    groups.push({
      label: t("sidebar.groups.management"),
      items: platformItems.map((item) => ({
        title: t(item.labelKey),
        url: item.href,
        icon: <item.icon className="h-4 w-4" />,
        badgeKey: item.badgeKey,
      })),
    });
  }

  if (financeItems.length > 0) {
    groups.push({
      label: t("sidebar.groups.finance"),
      items: financeItems.map((item) => ({
        title: t(item.labelKey),
        url: item.href,
        icon: <item.icon className="h-4 w-4" />,
        badgeKey: item.badgeKey,
      })),
    });
  }

  if (systemItems.length > 0) {
    groups.push({
      label: t("sidebar.groups.system"),
      items: systemItems.map((item) => ({
        title: t(item.labelKey),
        url: item.href,
        icon: <item.icon className="h-4 w-4" />,
        badgeKey: item.badgeKey,
      })),
    });
  }

  return groups;
}

/**
 * Helper function để check feature - Admin menu không cần check feature
 */
const noFeatureCheck = () => true;

/**
 * Header config cho Tamabee Admin
 */
const tamabeeHeaderConfig: SidebarHeaderConfig = {
  logo: <SidebarLogo size={32} />,
  name: "TAMABEE",
  fallback: "TM",
};

/**
 * TamabeeLayout - Layout cho /admin/* routes
 * Chỉ dành cho ADMIN_TAMABEE và MANAGER_TAMABEE
 */
export default function TamabeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, status } = useAuth();
  const t = useTranslations();
  const { count: pendingDepositsCount } = usePendingDepositsCount();

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

  // Filter menu items theo role (Admin menu không cần check feature)
  const filteredItems = filterMenuItems(
    ADMIN_MENU_ITEMS,
    noFeatureCheck,
    user.role,
  );
  const sidebarGroups = convertToSidebarGroups(filteredItems, t);

  const badgeCounts = {
    pendingDeposits: pendingDepositsCount,
  };

  return (
    <div className="flex flex-col justify-center">
      <SidebarProvider>
        <BaseSidebar
          groups={sidebarGroups}
          headerConfig={tamabeeHeaderConfig}
          badgeCounts={badgeCounts}
          userRole={user.role}
        />
        <main className="w-full">
          <div className="sticky top-0 z-10 flex items-center justify-between w-full bg-primary-foreground border-b border-primary/20 h-[50px] px-4">
            <div className="flex items-center">
              <SidebarTrigger size="icon-lg" className="relative right-2" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <BreadcrumbRouter />
            </div>
            <div>
              <ToggleTheme />
            </div>
          </div>
          <div className="p-4 pb-20 md:pb-4">{children}</div>
        </main>
      </SidebarProvider>
    </div>
  );
}
