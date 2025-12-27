import { AdminLayoutWrapper } from "../_components/AdminLayoutWrapper";
import { tamabeeSidebarItems } from "./_components/TamabeeSidebarItems";

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
