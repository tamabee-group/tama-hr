"use client";

import { AdminLayoutWrapper } from "../_components/_admin-layout-wrapper";
import { useEmployeeSidebarGroups } from "./_components/_employee-sidebar-items";
import type { SidebarHeaderConfig } from "@/types/sidebar";
import { SidebarLogo } from "@/app/[locale]/_components/_logo";

// Header config cho Employee Tamabee
const employeeHeaderConfig: SidebarHeaderConfig = {
  logo: <SidebarLogo size={32} />,
  name: "Tamabee",
  fallback: "T",
};

/**
 * Layout cho Employee Tamabee
 * Sử dụng AdminLayoutWrapper với sidebar groups riêng cho employee
 */
export default function EmployeeTamabeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarGroups = useEmployeeSidebarGroups();

  return (
    <AdminLayoutWrapper
      sidebarGroups={sidebarGroups}
      headerConfig={employeeHeaderConfig}
    >
      {children}
    </AdminLayoutWrapper>
  );
}
