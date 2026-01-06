import { getTranslations } from "next-intl/server";
import { LeaveApprovalList } from "./_leave-approval-list";

/**
 * Trang danh sách yêu cầu nghỉ phép
 * Server Component - fetch translations và render LeaveApprovalList
 */
export default async function LeavesPage() {
  const t = await getTranslations("leave");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("pendingRequests")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("description")}</p>
      </div>

      <LeaveApprovalList />
    </div>
  );
}
