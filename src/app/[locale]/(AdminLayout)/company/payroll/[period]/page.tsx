import { getTranslations } from "next-intl/server";
import { PayrollPeriodDetail } from "../_payroll-period-detail";

interface PayrollPeriodPageProps {
  params: Promise<{
    period: string; // Format: YYYY-MM
  }>;
}

/**
 * Trang chi tiết bảng lương theo kỳ
 * Server Component - fetch translations và render PayrollPeriodDetail
 */
export default async function PayrollPeriodPage({
  params,
}: PayrollPeriodPageProps) {
  const { period } = await params;
  const t = await getTranslations("payroll");

  // Parse period string (YYYY-MM)
  const [year, month] = period.split("-").map(Number);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("period")}: {month}/{year}
        </p>
      </div>

      <PayrollPeriodDetail period={{ year, month }} />
    </div>
  );
}
