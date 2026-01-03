import { getTranslations } from "next-intl/server";
import { OvertimeReportContent } from "./_overtime-report-content";

/**
 * Trang báo cáo tăng ca (Company)
 * Hiển thị phân tích chi tiết giờ tăng ca theo loại
 */
export default async function OvertimeReportPage() {
  const t = await getTranslations("reports");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("overtime.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("overtime.description")}
        </p>
      </div>

      <OvertimeReportContent />
    </div>
  );
}
