import { NotificationDetail } from "./_notification-detail";

/**
 * Trang chi tiết thông báo
 * Server Component — render NotificationDetail client component
 */
export default async function NotificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <NotificationDetail notificationId={Number(id)} />;
}
