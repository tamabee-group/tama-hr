import { getTranslations } from "next-intl/server";
import { BreakComplianceReportContent } from "./_break-compliance-report-content";

/**
 * Trang báo cáo tuân thủ giờ nghỉ (Dashboard)
 * Hiển thị phân tích mức độ tuân thủ quy định giờ nghỉ
 */
export default async function BreakComplianceReportPage() {
  const t = await getTranslations("reports");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("breakCompliance.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("breakCompliance.description")}
        </p>
      </div>

      <BreakComplianceReportContent />
    </div>
  );
}
