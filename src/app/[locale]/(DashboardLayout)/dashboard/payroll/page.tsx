import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PayrollPeriodTable } from "./_payroll-period-table";

/**
 * Trang quản lý kỳ lương
 * Server Component - hiển thị danh sách payroll periods với status
 */
export default async function PayrollPage() {
  const t = await getTranslations("payroll");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("periodsTitle")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("description")}
          </p>
        </div>
        <Link href="/dashboard/payslip">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            {t("viewAllPayslips")}
          </Button>
        </Link>
      </div>

      <PayrollPeriodTable />
    </div>
  );
}
