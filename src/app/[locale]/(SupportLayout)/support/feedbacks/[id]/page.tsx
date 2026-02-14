import { SupportFeedbackDetail } from "./_feedback-detail";

/**
 * Trang chi tiết feedback (Support Layout)
 * Server Component — render client component
 */
export default async function SupportFeedbackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SupportFeedbackDetail feedbackId={Number(id)} />;
}
