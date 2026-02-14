import { DashboardLayoutClient } from "./_components/_dashboard-layout-client";

/**
 * DashboardLayout - Server Component layout cho /dashboard/* routes
 * Client logic được xử lý trong DashboardLayoutClient
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
