import { getTranslations } from "next-intl/server";
import { PayrollSummaryReportContent } from "./_payroll-summary-report-content";

/**
 * Trang báo cáo tổng hợp lương (Dashboard)
 * Hiển thị tổng hợp chi phí lương theo kỳ
 */
export default async function PayrollSummaryReportPage() {
  const t = await getTranslations("reports");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("payrollSummary.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("payrollSummary.description")}
        </p>
      </div>

      <PayrollSummaryReportContent />
    </div>
  );
}
