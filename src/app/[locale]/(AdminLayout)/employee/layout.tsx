import { AdminLayoutWrapper } from "../_components/_admin-layout-wrapper";
import { employeeSidebarGroups } from "./_components/_employee-sidebar-items";
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
  return (
    <AdminLayoutWrapper
      sidebarGroups={employeeSidebarGroups}
      headerConfig={employeeHeaderConfig}
    >
      {children}
    </AdminLayoutWrapper>
  );
}
