"use client";

import { AdminLayoutWrapper } from "../_components/_admin-layout-wrapper";
import {
  useEmployeeSidebarGroups,
  useEmployeeMobileNavItems,
} from "./_components/_employee-sidebar-items";
import type { SidebarHeaderConfig } from "@/types/sidebar";
import { SidebarLogo } from "@/app/[locale]/_components/_logo";
import { useAuth } from "@/lib/auth";

// Header config cho Employee Tamabee
const employeeHeaderConfig: SidebarHeaderConfig = {
  logo: <SidebarLogo size={32} />,
  name: "Tamabee",
  fallback: "T",
};

/**
 * Layout cho Employee Tamabee
 * Sử dụng AdminLayoutWrapper với sidebar groups riêng cho employee
 * userRole được truyền để filter sidebar items theo permission
 */
export default function EmployeeTamabeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const sidebarGroups = useEmployeeSidebarGroups();
  const mobileNavItems = useEmployeeMobileNavItems();

  return (
    <AdminLayoutWrapper
      sidebarGroups={sidebarGroups}
      headerConfig={employeeHeaderConfig}
      mobileNavItems={mobileNavItems}
      userRole={user?.role}
    >
      {children}
    </AdminLayoutWrapper>
  );
}
