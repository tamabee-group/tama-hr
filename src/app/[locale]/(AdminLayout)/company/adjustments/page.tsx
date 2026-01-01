import { getTranslations } from "next-intl/server";
import { ApprovalList } from "./_approval-list";

/**
 * Trang danh sách yêu cầu điều chỉnh chấm công (Company)
 * Server Component - fetch translations và render ApprovalList
 */
export default async function CompanyAdjustmentsPage() {
  const t = await getTranslations("attendance");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("pendingAdjustments")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("adjustment.pendingRequests")}
        </p>
      </div>

      <ApprovalList />
    </div>
  );
}
