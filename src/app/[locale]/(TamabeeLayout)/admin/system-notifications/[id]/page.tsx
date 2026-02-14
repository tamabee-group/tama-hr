import { SystemNotificationDetail } from "./_notification-detail";

/**
 * Trang chi tiết system notification (Admin)
 * Server Component — render client component
 */
export default async function SystemNotificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SystemNotificationDetail notificationId={Number(id)} />;
}
