import { AdminLayoutWrapper } from "../_components/AdminLayoutWrapper";
import { companySidebarItems } from "./_components/CompanySidebarItems";

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
