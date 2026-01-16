import { getTranslations } from "next-intl/server";
import { DepartmentContent } from "./_department-content";

/**
 * Trang quản lý phòng ban (Dashboard)
 * Server Component - fetch translations và render DepartmentContent
 */
export default async function DepartmentsPage() {
  const t = await getTranslations("departments");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("description")}</p>
      </div>

      <DepartmentContent />
    </div>
  );
}
