"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BaseSidebar } from "@/app/[locale]/_components/_base/base-sidebar";
import {
  DesktopHeader,
  MobileHeader,
  type HeaderConfig,
} from "@/app/[locale]/_components/_base/_layout-header";
import { InactiveCompanyBanner } from "@/app/[locale]/_components/company";
import { useAuth } from "@/hooks/use-auth";
import { usePendingCounts } from "@/hooks/use-pending-counts";
import {
  DASHBOARD_MENU_GROUPS,
  type MenuGroup,
  type MenuItem,
} from "@/constants/menu-items";
import type {
  SidebarGroup,
  SidebarHeaderConfig,
  SidebarItem,
} from "@/types/sidebar";
import type { UserRole } from "@/types/enums";

// Cấu hình header cho DashboardLayout
const dashboardHeaderConfig: HeaderConfig = {
  namespace: "dashboard",
  mainPages: {
    "/dashboard": "home.title",
    "/dashboard/employees": "employees.title",
    "/dashboard/attendance": "attendance.title",
    "/dashboard/payroll": "payroll.title",
    "/dashboard/settings": "settings.title",
    "/dashboard/leaves": "leaves.title",
    "/dashboard/leave-balances": "leaveBalance.title",
    "/dashboard/contracts": "contracts.title",
    "/dashboard/shifts": "shifts.title",
    "/dashboard/holidays": "holidays.title",
    "/dashboard/departments": "departments.title",
    "/dashboard/adjustments": "adjustments.title",
    "/dashboard/profile": "profile.title",
    "/dashboard/wallet": "wallet.title",
    "/dashboard/plans": "plans.title",
    "/dashboard/support": "support.title",
    "/dashboard/payslip": "payslip.title",
  },
  subPageTitles: {
    "/dashboard/attendance/": "attendance.detail",
    "/dashboard/payroll/records/": "payroll.recordDetail",
    "/dashboard/payroll/": "payroll.periodDetail",
    "/dashboard/employees/create": "employees.create",
    "/dashboard/employees/": "employees.detail",
    "/dashboard/adjustments/": "adjustments.detail",
  },
};

// Các routes được phép truy cập khi company INACTIVE
const ALLOWED_INACTIVE_ROUTES = [
  "/dashboard/profile",
  "/dashboard/wallet",
  "/dashboard/plans",
];

/**
 * Chuyển đổi MenuGroup[] sang SidebarGroup[] format
 * Lọc theo role và company status
 */
function convertMenuGroupsToSidebarGroups(
  menuGroups: MenuGroup[],
  t: ReturnType<typeof useTranslations>,
  userRole: UserRole,
  isCompanyInactive: boolean,
  badgeCounts?: Record<string, number>,
): SidebarGroup[] {
  const groups: SidebarGroup[] = [];

  for (const group of menuGroups) {
    // Kiểm tra group có được phép cho role này không
    if (group.roles && !group.roles.includes(userRole)) {
      continue;
    }

    // Lọc items theo role và company status
    const filteredItems = group.items.filter((item) => {
      // Kiểm tra role
      if (item.roles && !item.roles.includes(userRole)) {
        return false;
      }
      // Khi company INACTIVE, chỉ hiển thị các routes được phép
      if (isCompanyInactive) {
        const isAllowed = ALLOWED_INACTIVE_ROUTES.some((route) =>
          item.href.includes(route),
        );
        if (!isAllowed) {
          return false;
        }
      }
      return true;
    });

    // Chỉ thêm group nếu có items
    if (filteredItems.length > 0) {
      groups.push({
        label: t(group.labelKey),
        items: convertMenuItemsToSidebarItems(filteredItems, t, badgeCounts),
      });
    }
  }

  return groups;
}

/**
 * Convert MenuItem[] sang SidebarItem[]
 */
function convertMenuItemsToSidebarItems(
  items: MenuItem[],
  t: ReturnType<typeof useTranslations>,
  badgeCounts?: Record<string, number>,
): SidebarItem[] {
  return items.map((item) => ({
    title: t(item.labelKey),
    url: item.href,
    icon: <item.icon className="h-4 w-4" />,
    badgeCount: badgeCounts?.[item.code],
    items: item.children
      ? item.children.map((child) => ({
          title: t(child.labelKey),
          url: child.href,
        }))
      : undefined,
  }));
}

/**
 * DashboardLayoutClient - Client wrapper cho DashboardLayout
 * Xử lý authentication và client-side logic
 */
export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, status } = useAuth();
  const t = useTranslations();

  // Kiểm tra company có bị INACTIVE không
  const isCompanyInactive = user?.companyStatus === "INACTIVE";

  // Lấy pending counts cho sidebar badges
  const pendingCounts = usePendingCounts();

  // Kiểm tra route hiện tại có được phép khi INACTIVE không
  const isAllowedRoute = ALLOWED_INACTIVE_ROUTES.some((route) =>
    pathname?.includes(route),
  );

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

    // EMPLOYEE_TAMABEE không được truy cập dashboard, redirect sang /support
    if (user.role === "EMPLOYEE_TAMABEE") {
      router.replace("/support");
      return;
    }

    // Nếu company INACTIVE và đang ở route không được phép, redirect về profile
    if (isCompanyInactive && !isAllowedRoute) {
      const locale = pathname?.split("/")[1] || "vi";
      router.replace(`/${locale}/dashboard/profile`);
    }
  }, [user, status, router, isCompanyInactive, isAllowedRoute, pathname]);

  // Loading state
  if (status === "loading" || !user) {
    return null;
  }

  // Không render nếu không có tenantDomain
  if (!user.tenantDomain) {
    return null;
  }

  // Không render nếu là EMPLOYEE_TAMABEE (đang redirect sang /support)
  if (user.role === "EMPLOYEE_TAMABEE") {
    return null;
  }

  // Filter menu items theo role và company status
  const badgeCounts: Record<string, number> = {
    adjustments: pendingCounts.pendingAdjustments,
    "leave-requests": pendingCounts.pendingLeaves,
  };

  const sidebarGroups = convertMenuGroupsToSidebarGroups(
    DASHBOARD_MENU_GROUPS,
    t,
    user.role,
    isCompanyInactive,
    badgeCounts,
  );

  // Header config - hiển thị company info
  const headerConfig: SidebarHeaderConfig = {
    name: user.companyName || user.tenantDomain.toUpperCase(),
    logo: user.companyLogo,
    fallback: (user.companyName || user.tenantDomain)[0]?.toUpperCase(),
  };

  return (
    <div className="flex flex-col justify-center">
      <SidebarProvider>
        <BaseSidebar
          key={user.companyLogo || "no-logo"}
          groups={sidebarGroups}
          headerConfig={headerConfig}
          userRole={user.role}
        />
        <main className="w-full">
          {/* Desktop Header */}
          <DesktopHeader config={dashboardHeaderConfig} />
          {/* Mobile Header */}
          <MobileHeader />
          {/* Banner cảnh báo khi company INACTIVE */}
          {isCompanyInactive && <InactiveCompanyBanner />}
          <div className="p-4 pb-20 md:pb-4">{children}</div>
        </main>
      </SidebarProvider>
    </div>
  );
}
