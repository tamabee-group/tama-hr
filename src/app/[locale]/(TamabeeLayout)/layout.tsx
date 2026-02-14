import { TamabeeLayoutClient } from "./_components/_tamabee-layout-client";

/**
 * TamabeeLayout - Server Component layout cho /admin/* routes
 * Client logic được xử lý trong TamabeeLayoutClient
 */
export default function TamabeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TamabeeLayoutClient>{children}</TamabeeLayoutClient>;
}
