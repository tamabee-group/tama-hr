import { getTranslations } from "next-intl/server";
import { BreakReportContent } from "./_break-report-content";

/**
 * Trang báo cáo giờ giải lao (Dashboard)
 * Server Component - fetch translations và render BreakReportContent
 */
export default async function BreakReportPage() {
  const t = await getTranslations("reports");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("break.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("break.description")}
        </p>
      </div>

      <BreakReportContent />
    </div>
  );
}
