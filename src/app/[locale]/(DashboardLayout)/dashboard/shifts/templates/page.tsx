import { getTranslations } from "next-intl/server";
import { ShiftTemplateList } from "./_shift-template-list";

/**
 * Trang danh sách mẫu ca làm việc
 * Server Component - fetch translations và render ShiftTemplateList
 */
export default async function ShiftTemplatesPage() {
  const t = await getTranslations("shifts");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("templatesTitle")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("templatesDescription")}
        </p>
      </div>

      <ShiftTemplateList />
    </div>
  );
}
