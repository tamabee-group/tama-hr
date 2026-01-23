import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { PayrollItem } from "@/types/attendance-records";
import { formatCurrency } from "@/lib/utils/format-currency";

interface PayslipCardProps {
  payslip: PayrollItem;
  companyName?: string;
  employeeCode?: string;
  employeeName?: string;
}

/**
 * Component hiển thị bảng lương theo layout giống PDF
 * Responsive: Desktop 4 cột, Mobile xếp dọc
 */
export function PayslipCard({
  payslip,
  companyName,
  employeeCode,
  employeeName,
}: PayslipCardProps) {
  const t = useTranslations("payroll.card");

  // Tính năm Reiwa từ năm dương lịch (Reiwa bắt đầu từ 2019)
  const getJapaneseEraYear = (year: number) => {
    return String(year - 2018).padStart(2, "0");
  };

  // Format title
  const formatTitle = () => {
    if (!payslip.year || !payslip.month) return "";
    const payMonth = payslip.month + 1 > 12 ? 1 : payslip.month + 1;
    const payYear = payslip.month + 1 > 12 ? payslip.year + 1 : payslip.year;
    const monthStr = String(payMonth).padStart(2, "0");

    return t("titleFormat", {
      month: monthStr,
      year: payYear,
      eraYear: getJapaneseEraYear(payYear),
    });
  };

  // Format period
  const formatPeriod = () => {
    if (!payslip.year || !payslip.month) return "";
    const lastDay = new Date(payslip.year, payslip.month, 0).getDate();
    const monthStr = String(payslip.month).padStart(2, "0");

    return t("periodFormat", {
      start: `01/${monthStr}`,
      end: `${lastDay}/${monthStr}/${payslip.year}`,
    });
  };

  // Format overtime hours
  const formatOvertimeHours = () => {
    const total =
      (payslip.regularOvertimeMinutes || 0) +
      (payslip.nightOvertimeMinutes || 0) +
      (payslip.holidayOvertimeMinutes || 0);
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
  };

  const workingDays = payslip.workingDays || 0;

  const name = employeeName || payslip.employeeName;
  const code = employeeCode || "";

  return (
    <Card className="w-full">
      <CardContent className="p-4 md:p-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-6">
          <div className="flex-1">
            <h2 className="text-lg md:text-xl font-bold mb-2">
              {formatTitle()}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {formatPeriod()}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium">{t("netSalary")}:</span>
              <span className="text-xl md:text-2xl font-bold">
                {formatCurrency(payslip.netSalary)}
              </span>
            </div>
          </div>

          <div className="border rounded-lg p-4 md:w-64">
            {companyName && (
              <p className="font-medium text-base mb-1">{companyName}</p>
            )}
            {code && (
              <p className="text-sm text-muted-foreground mb-2">
                {t("employeeId")}: {code}
              </p>
            )}
            <p className="font-medium">{name}</p>
          </div>
        </div>

        {/* Main Content - 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Column 1: Attendance */}
          <PayslipColumn title={t("attendance")}>
            <PayslipRow label={t("workingDays")} value={String(workingDays)} />
            <PayslipRow
              label={t("overtimeHours")}
              value={formatOvertimeHours()}
            />
          </PayslipColumn>

          {/* Column 2: Earnings */}
          <PayslipColumn title={t("earnings")}>
            <PayslipRow
              label={t("baseSalary")}
              value={formatCurrency(payslip.baseSalary)}
            />
            {payslip.allowanceDetails?.map((item, index) => (
              <PayslipRow
                key={index}
                label={item.name || t("allowance")}
                value={formatCurrency(item.amount)}
              />
            ))}
            {payslip.totalOvertimePay > 0 && (
              <PayslipRow
                label={t("overtimePay")}
                value={formatCurrency(payslip.totalOvertimePay)}
              />
            )}
            <PayslipTotalRow
              label={t("total")}
              value={formatCurrency(payslip.grossSalary)}
            />
          </PayslipColumn>

          {/* Column 3: Deductions */}
          <PayslipColumn title={t("deductions")}>
            {payslip.deductionDetails?.map((item, index) => (
              <PayslipRow
                key={index}
                label={item.name || t("deductions")}
                value={formatCurrency(item.amount)}
              />
            ))}
            {(!payslip.deductionDetails ||
              payslip.deductionDetails.length === 0) && (
              <PayslipRow label="-" value="-" />
            )}
            <PayslipTotalRow
              label={t("total")}
              value={formatCurrency(payslip.totalDeductions)}
            />
          </PayslipColumn>

          {/* Column 4: Others */}
          <PayslipColumn title={t("others")}>
            <PayslipRow
              label={t("bankTransfer")}
              value={formatCurrency(payslip.netSalary)}
            />
          </PayslipColumn>
        </div>

        {/* Remarks Section */}
        <div className="mt-6">
          <div className="inline-block bg-gray-500 text-white text-sm px-3 py-1">
            {t("remarks")}
          </div>
          <div className="border p-4 min-h-[60px]" />
        </div>
      </CardContent>
    </Card>
  );
}

// Sub-components
interface PayslipColumnProps {
  title: string;
  children: React.ReactNode;
}

function PayslipColumn({ title, children }: PayslipColumnProps) {
  return (
    <div className="border">
      <div className="bg-gray-500 text-white text-center py-2 text-sm font-medium">
        {title}
      </div>
      <div className="p-2 space-y-1 min-h-[200px] flex flex-col">
        {children}
      </div>
    </div>
  );
}

interface PayslipRowProps {
  label: string;
  value: string;
}

function PayslipRow({ label, value }: PayslipRowProps) {
  return (
    <div className="flex justify-between items-center text-sm py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function PayslipTotalRow({ label, value }: PayslipRowProps) {
  return (
    <div className="flex justify-between items-center text-sm py-1 mt-auto border-t pt-2">
      <span className="font-medium">{label}</span>
      <span className="font-bold tabular-nums">{value}</span>
    </div>
  );
}
