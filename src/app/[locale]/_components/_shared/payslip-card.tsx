"use client";

import { useLocale } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { PayrollRecord } from "@/types/attendance-records";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";

interface PayslipCardProps {
  payslip: PayrollRecord;
  companyName?: string;
  companyLocale?: string; // Locale của company (timezone format: Asia/Tokyo, Asia/Ho_Chi_Minh)
  employeeCode?: string;
  employeeName?: string;
}

/**
 * Component hiển thị bảng lương theo layout giống PDF
 * - Labels: theo ngôn ngữ người dùng (useLocale)
 * - Đơn vị tiền tệ: theo locale của company
 * Responsive: Desktop 4 cột, Mobile xếp dọc
 */
export function PayslipCard({
  payslip,
  companyName,
  companyLocale,
  employeeCode,
  employeeName,
}: PayslipCardProps) {
  const locale = useLocale() as SupportedLocale;

  // Chuyển đổi company locale (timezone) sang currency locale
  const getCurrencyLocale = (): SupportedLocale => {
    if (!companyLocale) return "ja"; // default
    if (
      companyLocale.includes("Ho_Chi_Minh") ||
      companyLocale.includes("Vietnam")
    ) {
      return "vi";
    }
    return "ja"; // Japan default
  };

  const currencyLocale = getCurrencyLocale();

  // Tính năm Reiwa từ năm dương lịch (Reiwa bắt đầu từ 2019)
  const getJapaneseEraYear = (year: number) => {
    return year - 2018; // 2019 = Reiwa 1
  };

  // Format title theo locale
  const formatTitle = () => {
    const payMonth = payslip.month + 1 > 12 ? 1 : payslip.month + 1;
    const payYear = payslip.month + 1 > 12 ? payslip.year + 1 : payslip.year;

    if (locale === "ja") {
      const eraYear = String(getJapaneseEraYear(payYear)).padStart(2, "0");
      return `${payYear}(令和${eraYear})年${payMonth}月15日支給分 給与明細`;
    }
    if (locale === "en") {
      const monthName = new Date(payYear, payMonth - 1).toLocaleString("en", {
        month: "long",
      });
      return `Payslip for ${monthName} ${payYear}`;
    }
    return `Phiếu lương tháng ${String(payMonth).padStart(2, "0")}/${payYear}`;
  };

  // Format period
  const formatPeriod = () => {
    const lastDay = new Date(payslip.year, payslip.month, 0).getDate();
    if (locale === "ja") {
      return `対象期間:   ${payslip.month}月01日   ~   ${payslip.month}月${lastDay}日`;
    }
    if (locale === "en") {
      return `Period: 01/${String(payslip.month).padStart(2, "0")} ~ ${lastDay}/${String(payslip.month).padStart(2, "0")}/${payslip.year}`;
    }
    return `Kỳ lương: 01/${String(payslip.month).padStart(2, "0")} ~ ${lastDay}/${String(payslip.month).padStart(2, "0")}/${payslip.year}`;
  };

  // Labels theo locale
  const getLabels = () => {
    if (locale === "ja") {
      return {
        netSalary: "差引支給額",
        employeeId: "社員番号",
        attendance: "勤怠",
        earnings: "支給",
        deductions: "控除",
        others: "その他",
        workingDays: "出勤日数",
        overtimeHours: "残業時間",
        baseSalary: "基本給",
        allowance: "手当",
        overtimePay: "残業手当",
        total: "合計",
        bankTransfer: "銀行振込額",
        remarks: "備考",
      };
    }
    if (locale === "en") {
      return {
        netSalary: "Net Salary",
        employeeId: "Employee ID",
        attendance: "Attendance",
        earnings: "Earnings",
        deductions: "Deductions",
        others: "Others",
        workingDays: "Working Days",
        overtimeHours: "Overtime Hours",
        baseSalary: "Base Salary",
        allowance: "Allowance",
        overtimePay: "Overtime Pay",
        total: "Total",
        bankTransfer: "Bank Transfer",
        remarks: "Remarks",
      };
    }
    // Vietnamese (default)
    return {
      netSalary: "Lương thực nhận",
      employeeId: "Mã NV",
      attendance: "Chấm công",
      earnings: "Thu nhập",
      deductions: "Khấu trừ",
      others: "Khác",
      workingDays: "Ngày công",
      overtimeHours: "Giờ tăng ca",
      baseSalary: "Lương cơ bản",
      allowance: "Phụ cấp",
      overtimePay: "Lương tăng ca",
      total: "Tổng",
      bankTransfer: "Chuyển khoản",
      remarks: "Ghi chú",
    };
  };

  const labels = getLabels();

  // Format overtime hours
  const formatOvertimeHours = () => {
    const total =
      (payslip.regularOvertimeMinutes || 0) +
      (payslip.nightOvertimeMinutes || 0) +
      (payslip.holidayMinutes || 0);
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
  };

  // Working days từ API hoặc tính từ regularMinutes
  const workingDays =
    payslip.workingDays ??
    (payslip.regularMinutes ? Math.round(payslip.regularMinutes / 480) : 0);

  const name = employeeName || payslip.employeeName;
  const code = employeeCode || "";

  return (
    <Card className="w-full">
      <CardContent className="p-4 md:p-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-6">
          {/* Left: Title & Period */}
          <div className="flex-1">
            <h2 className="text-lg md:text-xl font-bold mb-2">
              {formatTitle()}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {formatPeriod()}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium">{labels.netSalary}:</span>
              <span className="text-xl md:text-2xl font-bold">
                {formatCurrency(payslip.netSalary, currencyLocale)}
              </span>
            </div>
          </div>

          {/* Right: Company Info Box */}
          <div className="border rounded-lg p-4 md:w-64">
            {companyName && (
              <p className="font-medium text-base mb-1">{companyName}</p>
            )}
            {code && (
              <p className="text-sm text-muted-foreground mb-2">
                {labels.employeeId}: {code}
              </p>
            )}
            <p className="font-medium">{name}</p>
          </div>
        </div>

        {/* Main Content - 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Column 1: Attendance */}
          <PayslipColumn title={labels.attendance}>
            <PayslipRow
              label={labels.workingDays}
              value={String(workingDays)}
            />
            <PayslipRow
              label={labels.overtimeHours}
              value={formatOvertimeHours()}
            />
          </PayslipColumn>

          {/* Column 2: Earnings */}
          <PayslipColumn title={labels.earnings}>
            <PayslipRow
              label={labels.baseSalary}
              value={formatCurrency(payslip.baseSalary, currencyLocale)}
            />
            {payslip.allowanceDetails?.map((item, index) => (
              <PayslipRow
                key={index}
                label={item.name || labels.allowance}
                value={formatCurrency(item.amount, currencyLocale)}
              />
            ))}
            {payslip.totalOvertimePay > 0 && (
              <PayslipRow
                label={labels.overtimePay}
                value={formatCurrency(payslip.totalOvertimePay, currencyLocale)}
              />
            )}
            <PayslipTotalRow
              label={labels.total}
              value={formatCurrency(payslip.grossSalary, currencyLocale)}
            />
          </PayslipColumn>

          {/* Column 3: Deductions */}
          <PayslipColumn title={labels.deductions}>
            {payslip.deductionDetails?.map((item, index) => (
              <PayslipRow
                key={index}
                label={item.name || labels.deductions}
                value={formatCurrency(item.amount, currencyLocale)}
              />
            ))}
            {(!payslip.deductionDetails ||
              payslip.deductionDetails.length === 0) && (
              <PayslipRow label="-" value="-" />
            )}
            <PayslipTotalRow
              label={labels.total}
              value={formatCurrency(payslip.totalDeductions, currencyLocale)}
            />
          </PayslipColumn>

          {/* Column 4: Others */}
          <PayslipColumn title={labels.others}>
            <PayslipRow
              label={labels.bankTransfer}
              value={formatCurrency(payslip.netSalary, currencyLocale)}
            />
          </PayslipColumn>
        </div>

        {/* Remarks Section */}
        <div className="mt-6">
          <div className="inline-block bg-gray-500 text-white text-sm px-3 py-1">
            {labels.remarks}
          </div>
          <div className="border p-4 min-h-[60px]">{/* Empty remarks */}</div>
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
