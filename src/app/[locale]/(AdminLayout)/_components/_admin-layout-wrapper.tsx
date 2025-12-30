"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { BaseSidebar } from "@/app/[locale]/_components/_base/base-sidebar";
import { Separator } from "@/components/ui/separator";
import { ToggleTheme } from "@/app/[locale]/_components/_toggle-theme";
import { BreadcrumbRouter } from "./_breadcrumb-router";
import type { SidebarGroup, SidebarHeaderConfig } from "@/types/sidebar";

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
  sidebarGroups: SidebarGroup[];
  headerConfig: SidebarHeaderConfig;
  badgeCounts?: Record<string, number>;
  /** Role của user hiện tại, dùng để hiển thị visual indicators */
  userRole?: string;
}

/**
 * Layout wrapper dùng chung cho các trang admin (tamabee, company, employee)
 * @client-only - Cần client side cho sidebar state
 */
export function AdminLayoutWrapper({
  children,
  sidebarGroups,
  headerConfig,
  badgeCounts = {},
  userRole,
}: AdminLayoutWrapperProps) {
  const headerHeight = 50;

  return (
    <div className="flex flex-col justify-center">
      <SidebarProvider>
        <BaseSidebar
          groups={sidebarGroups}
          headerConfig={headerConfig}
          className=""
          headerHeight={headerHeight}
          badgeCounts={badgeCounts}
          userRole={userRole}
        />
        <main className="w-full">
          <div className="flex items-center justify-between w-full bg-primary-foreground border-b border-primary/20 h-[50px] px-4">
            <div className="flex items-center">
              <SidebarTrigger size={"icon-lg"} className="relative right-2" />
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
          <div className="p-4">{children}</div>
        </main>
      </SidebarProvider>
    </div>
  );
}
