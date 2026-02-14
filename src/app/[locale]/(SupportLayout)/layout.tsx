import { SupportLayoutClient } from "./_components/_support-layout-client";

/**
 * SupportLayout - Server Component layout cho /support/* routes
 * Dành cho EMPLOYEE_TAMABEE xử lý tác vụ hỗ trợ khách hàng
 */
export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SupportLayoutClient>{children}</SupportLayoutClient>;
}
