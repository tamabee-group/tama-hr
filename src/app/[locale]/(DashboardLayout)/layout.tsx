"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ToggleTheme } from "@/app/[locale]/_components/_toggle-theme";
import { BreadcrumbRouter } from "@/app/[locale]/_components/_shared/_breadcrumb-router";
import { BaseSidebar } from "@/app/[locale]/_components/_base/base-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { usePlanFeatures } from "@/hooks/use-plan-features";
import { DASHBOARD_MENU_ITEMS, type MenuItem } from "@/constants/menu-items";
import { filterMenuItems } from "@/lib/utils/filter-menu-items";
import type {
  SidebarGroup,
  SidebarHeaderConfig,
  SidebarItem,
} from "@/types/sidebar";

/**
 * Chuyển đổi MenuItem[] sang SidebarGroup[] format
 */
function convertToSidebarGroups(
  items: MenuItem[],
  t: ReturnType<typeof useTranslations>,
): SidebarGroup[] {
  // Nhóm items theo category
  const overviewItems = items.filter((item) =>
    ["dashboard"].includes(item.code),
  );
  const attendanceItems = items.filter((item) =>
    ["attendance", "schedules"].includes(item.code),
  );
  const hrItems = items.filter((item) =>
    ["payroll", "leave", "employees", "contracts", "reports"].includes(
      item.code,
    ),
  );
  const systemItems = items.filter((item) =>
    ["settings", "profile"].includes(item.code),
  );

  const groups: SidebarGroup[] = [];

  if (overviewItems.length > 0) {
    groups.push({
      label: t("sidebar.groups.overview"),
      items: convertMenuItemsToSidebarItems(overviewItems, t),
    });
  }

  if (attendanceItems.length > 0) {
    groups.push({
      label: t("sidebar.groups.attendance"),
      items: convertMenuItemsToSidebarItems(attendanceItems, t),
    });
  }

  if (hrItems.length > 0) {
    groups.push({
      label: t("sidebar.groups.hr"),
      items: convertMenuItemsToSidebarItems(hrItems, t),
    });
  }

  if (systemItems.length > 0) {
    groups.push({
      label: t("sidebar.groups.system"),
      items: convertMenuItemsToSidebarItems(systemItems, t),
    });
  }

  return groups;
}

/**
 * Convert MenuItem[] sang SidebarItem[]
 */
function convertMenuItemsToSidebarItems(
  items: MenuItem[],
  t: ReturnType<typeof useTranslations>,
): SidebarItem[] {
  return items.map((item) => ({
    title: t(item.labelKey),
    url: item.href,
    icon: <item.icon className="h-4 w-4" />,
    badgeKey: item.badgeKey,
    items: item.children
      ? item.children.map((child) => ({
          title: t(child.labelKey),
          url: child.href,
        }))
      : undefined,
  }));
}

/**
 * DashboardLayout - Layout cho /dashboard/* routes
 * Dành cho tất cả users có tenantDomain (kể cả Tamabee employees)
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, status } = useAuth();
  const { hasFeature } = usePlanFeatures();
  const t = useTranslations();

  // Kiểm tra quyền truy cập
  useEffect(() => {
    if (status === "loading") return;

    if (!user) {
      router.replace("/login");
      return;
    }

    // Cần có tenantDomain để truy cập dashboard
    if (!user.tenantDomain) {
      router.replace("/unauthorized");
      return;
    }
  }, [user, status, router]);

  // Loading state
  if (status === "loading" || !user) {
    return null;
  }

  // Không render nếu không có tenantDomain
  if (!user.tenantDomain) {
    return null;
  }

  // Filter menu items theo plan features và role
  const filteredItems = filterMenuItems(
    DASHBOARD_MENU_ITEMS,
    hasFeature,
    user.role,
  );
  const sidebarGroups = convertToSidebarGroups(filteredItems, t);

  // Header config - hiển thị company info
  const headerConfig: SidebarHeaderConfig = {
    name: user.companyName || user.tenantDomain.toUpperCase(),
    fallback: (user.companyName || user.tenantDomain)[0]?.toUpperCase(),
  };

  return (
    <div className="flex flex-col justify-center">
      <SidebarProvider>
        <BaseSidebar
          groups={sidebarGroups}
          headerConfig={headerConfig}
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
