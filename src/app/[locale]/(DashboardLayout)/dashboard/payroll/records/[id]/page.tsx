import { PayrollRecordDetail } from "../../_payroll-record-detail";

interface PayrollRecordPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Trang chi tiết bản ghi lương
 * Server Component - fetch translations và render PayrollRecordDetail
 */
export default async function PayrollRecordPage({
  params,
}: PayrollRecordPageProps) {
  const { id } = await params;

  return <PayrollRecordDetail recordId={parseInt(id, 10)} />;
}
