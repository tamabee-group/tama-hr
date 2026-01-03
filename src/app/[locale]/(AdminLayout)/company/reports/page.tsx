import { getTranslations } from "next-intl/server";
import { ReportTypeCards } from "./_report-type-cards";

/**
 * Trang báo cáo (Company)
 * Hiển thị các loại báo cáo có sẵn
 */
export default async function ReportsPage() {
  const t = await getTranslations("reports");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("description")}</p>
      </div>

      <ReportTypeCards />
    </div>
  );
}
