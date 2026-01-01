import { getTranslations } from "next-intl/server";
import { ScheduleTable } from "./_schedule-table";

/**
 * Trang danh sách lịch làm việc
 * Server Component - fetch translations và render ScheduleTable
 */
export default async function SchedulesPage() {
  const t = await getTranslations("schedules");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("description")}</p>
      </div>

      <ScheduleTable />
    </div>
  );
}
