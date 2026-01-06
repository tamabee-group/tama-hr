import { getTranslations } from "next-intl/server";
import { ShiftAssignmentList } from "./_shift-assignment-list";

/**
 * Trang phân công ca làm việc
 * Server Component - fetch translations và render ShiftAssignmentList
 */
export default async function ShiftAssignmentsPage() {
  const t = await getTranslations("shifts");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("assignmentsTitle")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("assignmentsDescription")}
        </p>
      </div>

      <ShiftAssignmentList />
    </div>
  );
}
