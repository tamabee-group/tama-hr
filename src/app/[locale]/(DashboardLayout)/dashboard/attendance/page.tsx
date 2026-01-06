import { getTranslations } from "next-intl/server";
import { AttendanceTable } from "./_attendance-table";

/**
 * Trang danh sách chấm công của tất cả nhân viên
 * Server Component - fetch translations và render AttendanceTable
 */
export default async function AttendancePage() {
  const t = await getTranslations("attendance");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("description")}</p>
      </div>

      <AttendanceTable />
    </div>
  );
}
