import { getTranslations } from "next-intl/server";
import { EmployeeSchedulePageContent } from "./_page-content";

/**
 * Trang lịch làm việc của Employee (Server Component)
 * Hiển thị lịch hiện tại và cho phép chọn lịch mới
 */
export default async function EmployeeSchedulePage() {
  const t = await getTranslations("schedules");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("mySchedule")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <EmployeeSchedulePageContent />
    </div>
  );
}
