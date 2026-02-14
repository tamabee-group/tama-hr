import { PayrollPeriodDetailContent } from "./_page-content";

interface PayrollPeriodPageProps {
  params: Promise<{
    period: string; // Period ID
  }>;
}

/**
 * Trang chi tiết kỳ lương
 * Server Component - hiển thị payroll items với summary
 */
export default async function PayrollPeriodPage({
  params,
}: PayrollPeriodPageProps) {
  const { period } = await params;

  // Parse period ID
  const periodId = parseInt(period);

  return <PayrollPeriodDetailContent periodId={periodId} />;
}
