"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BaseSidebar } from "@/app/[locale]/_components/_base/base-sidebar";
import { BottomNavigation } from "../me/_components/_bottom-navigation";
import {
  DesktopHeader,
  MobileHeader,
  HeaderConfig,
} from "@/app/[locale]/_components/_base/_layout-header";
import { LayoutSkeleton } from "./_layout-skeleton";
import { useSidebarConfig } from "./_sidebar-config";
import { useAuth } from "@/hooks/use-auth";
import { InactiveOverlay } from "@/app/[locale]/_components/_inactive-overlay";
import type { SidebarHeaderConfig } from "@/types/sidebar";

/**
 * Cấu hình header cho PersonalLayout
 * Định nghĩa các trang chính (level 1) và namespace cho translations
 */
const personalHeaderConfig: HeaderConfig = {
  namespace: "portal",
  mainPages: {
    "/me": "home.title",
    "/me/schedule": "schedule.title",
    "/me/leave": "leave.title",
    "/me/payroll": "payroll.title",
    "/me/profile": "profile.title",
    "/me/contract": "contract.title",
    "/me/documents": "documents.title",
    "/me/attendance": "attendance.title",
    "/me/adjustments": "adjustments.title",
    "/me/commissions": "commissions.title",
    "/me/notifications": "notifications.title",
    "/me/help": "help.title",
  },
  subPageTitles: {
    "/me/attendance/": "attendance.detail",
    "/me/help/": "help.title",
    "/me/notifications/": "notifications.title",
  },
  helpMapping: {
    "/me": { topic: "attendance", article: "how_to_checkin" },
    "/me/attendance": { topic: "attendance", article: "view_history" },
    "/me/attendance/": { topic: "attendance", article: "view_history" },
    "/me/schedule": { topic: "shifts", article: "view_schedule" },
    "/me/leave": { topic: "leave", article: "request_leave" },
    "/me/payroll": { topic: "payroll", article: "view_payslip" },
    "/me/profile": { topic: "profile", article: "update_profile" },
    "/me/contract": { topic: "employee_management", article: "contract_setup" },
    "/me/adjustments": { topic: "attendance", article: "request_adjustment" },
  },
};

/**
 * PersonalLayoutClient - Client wrapper cho PersonalLayout
 * Xử lý authentication và client-side logic
 */
export function PersonalLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, status } = useAuth();
  const isTamabeeEmployee = user?.role?.includes("TAMABEE") ?? false;
  const isManager =
    user?.role?.includes("ADMIN") || user?.role?.includes("MANAGER") || false;
  const isTamabeeManager =
    user?.role === "ADMIN_TAMABEE" || user?.role === "MANAGER_TAMABEE";
  const sidebarGroups = useSidebarConfig(
    isTamabeeEmployee,
    isManager,
    isTamabeeManager ?? false,
  );

  // Kiểm tra quyền truy cập
  useEffect(() => {
    if (status === "loading") return;
    if (!user) {
      router.replace("/login");
    }
  }, [user, status, router]);

  // Loading state
  if (status === "loading" || !user) {
    return <LayoutSkeleton />;
  }

  // Header config - hiển thị company info
  const headerConfig: SidebarHeaderConfig = {
    name: user.companyName || user.tenantDomain.toUpperCase(),
    logo: user.companyLogo,
    fallback:
      (user.companyName || user.tenantDomain)?.[0]?.toUpperCase() || "C",
  };

  return (
    <div className="flex flex-col justify-center">
      {user.status === "INACTIVE" && <InactiveOverlay />}
      <SidebarProvider>
        <BaseSidebar
          key={user.companyLogo || "no-logo"}
          groups={sidebarGroups}
          headerConfig={headerConfig}
          userRole={user.role}
        />
        <main className="w-full">
          <DesktopHeader config={personalHeaderConfig} />
          <MobileHeader />
          <div className="p-4 pb-24 md:pb-4">{children}</div>
          <BottomNavigation />
        </main>
      </SidebarProvider>
    </div>
  );
}
