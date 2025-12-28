import { AdminLayoutWrapper } from "../_components/_admin-layout-wrapper";
import { companySidebarItems } from "./_components/_company-sidebar-items";

export default function CompanyAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayoutWrapper sidebarItems={companySidebarItems}>
      {children}
    </AdminLayoutWrapper>
  );
}
