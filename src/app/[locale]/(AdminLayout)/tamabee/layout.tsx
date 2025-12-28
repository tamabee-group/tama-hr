import { AdminLayoutWrapper } from "../_components/_admin-layout-wrapper";
import { tamabeeSidebarItems } from "./_components/_tamabee-sidebar-items";

export default function TamabeeAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayoutWrapper sidebarItems={tamabeeSidebarItems}>
      {children}
    </AdminLayoutWrapper>
  );
}
