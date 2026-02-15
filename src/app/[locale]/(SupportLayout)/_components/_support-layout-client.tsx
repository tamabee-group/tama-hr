"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BaseSidebar } from "@/app/[locale]/_components/_base/base-sidebar";
import { SidebarLogo } from "@/app/[locale]/_components/_logo";
import { useAuth } from "@/hooks/use-auth";
import { SUPPORT_MENU_ITEMS } from "@/constants/menu-items";
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
import { User, LayoutDashboard, Building } from "lucide-react";

/**
 * Header config cho SupportLayout
 */
const supportHeaderConfig: HeaderConfig = {
  namespace: "support",
  mainPages: {
    "/support": "home.title",
    "/support/referrals": "referrals.title",
    "/support/commissions": "commissions.title",
    "/support/feedbacks": "feedbacks.title",
  },
  subPageTitles: {
    "/support/referrals/": "referrals.title",
    "/support/feedbacks/": "feedbacks.title",
    "/support/commissions/": "commissions.title",
  },
};

/**
 * Sidebar header config - Logo Tamabee
 */
const sidebarHeaderConfig: SidebarHeaderConfig = {
  logo: <SidebarLogo size={32} />,
  name: "TAMABEE",
  fallback: "TM",
};

/** Roles được phép truy cập SupportLayout */
const ALLOWED_ROLES = ["EMPLOYEE_TAMABEE", "ADMIN_TAMABEE", "MANAGER_TAMABEE"];

/**
 * Chuyển đổi SUPPORT_MENU_ITEMS sang SidebarGroup[] format
 */
function buildSidebarGroups(
  t: ReturnType<typeof useTranslations>,
  tSidebar: ReturnType<typeof useTranslations>,
  canAccessDashboard: boolean,
  badgeCounts?: Record<string, number>,
): SidebarGroup[] {
  const mainItems: SidebarItem[] = SUPPORT_MENU_ITEMS.map((item) => ({
    title: t(item.labelKey),
    url: item.href,
    icon: <item.icon className="h-4 w-4" />,
    badgeCount: badgeCounts?.[item.code],
  }));

  const groups: SidebarGroup[] = [
    {
      label: t("sidebar.main"),
      items: mainItems,
    },
  ];

  // Nhóm Quản lý - cross-layout navigation
  const managementItems: SidebarItem[] = [];

  if (canAccessDashboard) {
    managementItems.push(
      {
        title: tSidebar("items.dashboard"),
        url: "/dashboard",
        icon: <LayoutDashboard className="h-4 w-4" />,
      },
      {
        title: tSidebar("items.platformAdmin"),
        url: "/admin/companies",
        icon: <Building className="h-4 w-4" />,
      },
    );
  }

  managementItems.push({
    title: t("navigation.myPortal"),
    url: "/me",
    icon: <User className="h-4 w-4" />,
  });

  groups.push({
    label: tSidebar("groups.management"),
    items: managementItems,
  });

  return groups;
}

/**
 * SupportLayoutClient - Client wrapper cho SupportLayout
 * Dành cho EMPLOYEE_TAMABEE xử lý tác vụ hỗ trợ khách hàng
 */
export function SupportLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, status } = useAuth();
  const t = useTranslations("support");
  const tSidebar = useTranslations("sidebar");
  const adminCounts = useAdminPendingCounts();

  // Kiểm tra có quyền truy cập dashboard không
  const canAccessDashboard =
    user?.role === "ADMIN_TAMABEE" || user?.role === "MANAGER_TAMABEE";

  // Kiểm tra quyền truy cập
  useEffect(() => {
    if (status === "loading") return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!ALLOWED_ROLES.includes(user.role)) {
      router.replace("/unauthorized");
      return;
    }
  }, [user, status, router]);

  // Loading state
  if (status === "loading" || !user) {
    return null;
  }

  // Không render nếu không có quyền
  if (!ALLOWED_ROLES.includes(user.role)) {
    return null;
  }

  const sidebarGroups = buildSidebarGroups(
    t,
    tSidebar,
    canAccessDashboard ?? false,
    {
      "support-feedbacks": adminCounts.openFeedbacks,
    },
  );

  return (
    <div className="flex flex-col justify-center">
      <SidebarProvider>
        <BaseSidebar
          groups={sidebarGroups}
          headerConfig={sidebarHeaderConfig}
          userRole={user.role}
        />
        <main className="w-full">
          <DesktopHeader config={supportHeaderConfig} />
          <MobileHeader />
          <div className="p-4 pb-20 md:pb-4">{children}</div>
        </main>
      </SidebarProvider>
    </div>
  );
}
