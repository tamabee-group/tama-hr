"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { BaseSidebar } from "@/app/[locale]/_components/_base/BaseSidebar";
import { Separator } from "@/components/ui/separator";
import { ToggleTheme } from "@/app/[locale]/_components/ToggleTheme";
import { BreadcrumbRouter } from "./BreadcrumbRouter";
import type { SidebarItem } from "../tamabee/_components/TamabeeSidebarItems";

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
  sidebarItems: SidebarItem[];
}

/**
 * Layout wrapper dùng chung cho các trang admin (tamabee, company)
 * @client-only - Cần client side cho sidebar state
 */
export function AdminLayoutWrapper({
  children,
  sidebarItems,
}: AdminLayoutWrapperProps) {
  const headerHeight = 50;

  return (
    <div className="flex flex-col justify-center">
      <SidebarProvider>
        <BaseSidebar
          items={sidebarItems}
          className=""
          headerHeight={headerHeight}
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
