import { getTranslations } from "next-intl/server";
import { PayrollPeriodTable } from "./_payroll-period-table";

/**
 * Trang quản lý kỳ lương
 * Server Component - hiển thị danh sách payroll periods với status
 */
export default async function PayrollPage() {
  const t = await getTranslations("payroll");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("periodsTitle")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("description")}</p>
      </div>

      <PayrollPeriodTable />
    </div>
  );
}
