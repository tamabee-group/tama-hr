/**
 * Layout group cho các trang admin
 * Mỗi sub-folder (tamabee, company) có layout riêng với sidebar items khác nhau
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
