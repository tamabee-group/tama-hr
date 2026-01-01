import { getTranslations } from "next-intl/server";
import { AttendanceReportContent } from "./_attendance-report-content";

/**
 * Trang báo cáo chấm công (Company)
 * Server Component - fetch translations và render AttendanceReportContent
 */
export default async function AttendanceReportPage() {
  const t = await getTranslations("reports");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("attendance.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("attendance.description")}
        </p>
      </div>

      <AttendanceReportContent />
    </div>
  );
}
