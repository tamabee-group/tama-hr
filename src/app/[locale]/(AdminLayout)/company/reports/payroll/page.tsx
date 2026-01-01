import { getTranslations } from "next-intl/server";
import { PayrollReportContent } from "./_payroll-report-content";

/**
 * Trang báo cáo lương (Company)
 * Server Component - fetch translations và render PayrollReportContent
 */
export default async function PayrollReportPage() {
  const t = await getTranslations("reports");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("payroll.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("payroll.description")}
        </p>
      </div>

      <PayrollReportContent />
    </div>
  );
}
