import { getTranslations } from "next-intl/server";
import { CostAnalysisReportContent } from "./_cost-analysis-report-content";

/**
 * Trang báo cáo phân tích chi phí (Dashboard)
 * Hiển thị phân tích cơ cấu chi phí nhân sự
 */
export default async function CostAnalysisReportPage() {
  const t = await getTranslations("reports");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("costAnalysis.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("costAnalysis.description")}
        </p>
      </div>

      <CostAnalysisReportContent />
    </div>
  );
}
