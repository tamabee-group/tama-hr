import { getTranslations } from "next-intl/server";
import { AdjustmentHistoryTable } from "./_adjustment-history-table";

export default async function EmployeeAdjustmentsPage() {
  const t = await getTranslations("attendance");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("adjustmentHistory")}</h1>
        <p className="text-muted-foreground">
          {t("adjustmentHistoryDescription")}
        </p>
      </div>

      <AdjustmentHistoryTable />
    </div>
  );
}
