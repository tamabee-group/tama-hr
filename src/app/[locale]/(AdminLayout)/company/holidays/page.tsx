import { getTranslations } from "next-intl/server";
import { HolidayTable } from "./_holiday-table";

/**
 * Trang quản lý ngày nghỉ lễ (Company)
 * Server Component - fetch translations và render HolidayTable
 */
export default async function HolidaysPage() {
  const t = await getTranslations("holidays");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("description")}</p>
      </div>

      <HolidayTable />
    </div>
  );
}
