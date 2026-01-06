import { getTranslations } from "next-intl/server";
import { PayslipList } from "./_payslip-list";

/**
 * Trang phiếu lương cá nhân (My Payslip)
 * Server Component - fetch translations và render PayslipList
 */
export default async function MyPayslipPage() {
  const t = await getTranslations("payroll");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("myPayslips")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("description")}</p>
      </div>

      <PayslipList />
    </div>
  );
}
