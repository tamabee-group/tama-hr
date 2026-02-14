import { PayrollRecordDetailContent } from "./_payroll-record-detail-content";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PayrollRecordDetailPage({ params }: PageProps) {
  const { id } = await params;
  const itemId = parseInt(id, 10);

  return <PayrollRecordDetailContent itemId={itemId} />;
}
