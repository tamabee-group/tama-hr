import { FeedbackDetailContent } from "./_feedback-detail";

/**
 * Trang chi tiết feedback — Server Component
 */
export default async function FeedbackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FeedbackDetailContent feedbackId={Number(id)} />;
}
