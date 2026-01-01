import { getTranslations } from "next-intl/server";
import { PayslipView } from "../_payslip-view";

interface PayslipDetailPageProps {
  params: Promise<{
    period: string; // Format: YYYY-MM
  }>;
}

/**
 * Trang chi tiết phiếu lương
 * Server Component - fetch translations và render PayslipView
 */
export default async function PayslipDetailPage({
  params,
}: PayslipDetailPageProps) {
  const { period } = await params;
  const t = await getTranslations("payroll");

  // Parse period (YYYY-MM)
  const [yearStr, monthStr] = period.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  // Validate period
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-muted-foreground">{t("messages.noPayslip")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PayslipView year={year} month={month} />
    </div>
  );
}
