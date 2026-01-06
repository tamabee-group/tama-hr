import { getTranslations } from "next-intl/server";
import { LeaveBalance } from "./_leave-balance";
import { LeaveRequestForm } from "./_leave-request-form";
import { LeaveHistory } from "./_leave-history";

/**
 * Trang nghỉ phép của nhân viên
 * Server Component - fetch translations và render các components
 */
export default async function MyLeavePage() {
  const t = await getTranslations("leave");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("myLeave")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("description")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Leave Balance */}
        <div className="lg:col-span-1">
          <LeaveBalance />
        </div>

        {/* Leave Request Form */}
        <div className="lg:col-span-2">
          <LeaveRequestForm />
        </div>
      </div>

      {/* Leave History */}
      <LeaveHistory />
    </div>
  );
}
