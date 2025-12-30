"use client";

import { AdminLayoutWrapper } from "../_components/_admin-layout-wrapper";
import { companySidebarGroups } from "./_components/_company-sidebar-items";
import { useMyCompany } from "@/hooks/use-my-company";
import { useAuth } from "@/lib/auth";
import type { SidebarHeaderConfig } from "@/types/sidebar";

/**
 * Layout cho Company Admin
 * Hiển thị logo và tên company trong sidebar header
 * companyName lấy từ user auth, logo lấy từ API company
 */
export default function CompanyAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const { company } = useMyCompany();

  // Header config: name từ user auth, logo từ company API
  const headerConfig: SidebarHeaderConfig = {
    logo: company?.logo,
    name: user?.companyName || company?.name || "Company",
    fallback: user?.companyName?.charAt(0) || company?.name?.charAt(0) || "C",
  };

  return (
    <AdminLayoutWrapper
      sidebarGroups={companySidebarGroups}
      headerConfig={headerConfig}
    >
      {children}
    </AdminLayoutWrapper>
  );
}
