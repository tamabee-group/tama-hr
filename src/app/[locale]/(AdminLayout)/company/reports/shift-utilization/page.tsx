import { getTranslations } from "next-intl/server";
import { ShiftUtilizationReportContent } from "./_shift-utilization-report-content";

/**
 * Trang báo cáo hiệu suất ca (Company)
 * Hiển thị phân tích mức độ sử dụng ca làm việc
 */
export default async function ShiftUtilizationReportPage() {
  const t = await getTranslations("reports");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("shiftUtilization.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("shiftUtilization.description")}
        </p>
      </div>

      <ShiftUtilizationReportContent />
    </div>
  );
}
