import { getTranslations } from "next-intl/server";
import { PayrollRecordDetail } from "../../_payroll-record-detail";

interface PayrollRecordPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Trang chi tiết bản ghi lương
 * Server Component - fetch translations và render PayrollRecordDetail
 */
export default async function PayrollRecordPage({
  params,
}: PayrollRecordPageProps) {
  const { id } = await params;
  const t = await getTranslations("payroll");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("breakdown.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("payslip")}</p>
      </div>

      <PayrollRecordDetail recordId={parseInt(id, 10)} />
    </div>
  );
}
