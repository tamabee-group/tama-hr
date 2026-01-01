import { getTranslations } from "next-intl/server";
import { PayrollDashboard } from "./_payroll-dashboard";

/**
 * Trang tổng quan bảng lương
 * Server Component - fetch translations và render PayrollDashboard
 */
export default async function CompanyPayrollPage() {
  const t = await getTranslations("payroll");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("description")}</p>
      </div>

      <PayrollDashboard />
    </div>
  );
}
