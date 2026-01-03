import { getTranslations } from "next-intl/server";
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
  const t = await getTranslations("payroll");

  // Parse period ID
  const periodId = parseInt(period);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("itemDetailTitle")}</h1>
      </div>

      <PayrollPeriodDetailContent periodId={periodId} />
    </div>
  );
}
