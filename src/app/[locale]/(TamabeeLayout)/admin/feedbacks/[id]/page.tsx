import { AdminFeedbackDetail } from "./_feedback-detail";

/**
 * Trang chi tiết feedback (Admin)
 * Server Component — render client component
 */
export default async function AdminFeedbackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminFeedbackDetail feedbackId={Number(id)} />;
}
