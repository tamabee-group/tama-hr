import { getTranslations } from "next-intl/server";
import { ReportGenerator } from "./_report-generator";

/**
 * Trang báo cáo (Company)
 * Server Component - fetch translations và render ReportGenerator
 */
export default async function ReportsPage() {
  const t = await getTranslations("reports");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("description")}</p>
      </div>

      <ReportGenerator />
    </div>
  );
}
