"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Download } from "lucide-react";

import { BackButton } from "@/app/[locale]/_components/_base/_back-button";
import { Button } from "@/components/ui/button";
import { CurrencyDisplay } from "@/app/[locale]/_components/_shared/display/_currency-display";

import { PayrollItem } from "@/types/attendance-records";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { SupportedLocale } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/format-date-time";
import { useAuth } from "@/hooks/use-auth";
import {
  formatPayslipFilename,
  formatPayslipFullTitle,
} from "@/lib/utils/format-payslip";

// System item codes được tạo tự động bởi backend
const SYSTEM_ITEM_CODES = ["OVERTIME", "SHORTFALL"];

interface PayslipDetailViewProps {
  /** ID của payroll item */
  itemId: number;
  /** Hàm fetch chi tiết payslip */
  fetchDetail: (itemId: number) => Promise<PayrollItem>;
  /** Hàm download PDF */
  downloadPdf: (itemId: number) => Promise<Blob>;
  /** Hiển thị nút back */
  showBackButton?: boolean;
}

/**
 * Component hiển thị chi tiết payslip với layout 4 cột
 * Dùng chung cho cả employee portal (/me/payroll/[id]) và admin (/dashboard/payroll/records/[id])
 */
export function PayslipDetailView({
  itemId,
  fetchDetail,
  downloadPdf,
  showBackButton = true,
}: PayslipDetailViewProps) {
  const t = useTranslations("payroll");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;
  const { user } = useAuth();

  const [item, setItem] = useState<PayrollItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  // Lấy tên item, ưu tiên translation cho system items
  const getItemName = (code: string, name: string) => {
    if (SYSTEM_ITEM_CODES.includes(code)) {
      return t(`systemItems.${code}`);
    }
    return name;
  };

  useEffect(() => {
    const loadDetail = async () => {
      setLoading(true);
      try {
        const response = await fetchDetail(itemId);
        setItem(response);
      } catch (error) {
        toast.error(getErrorMessage((error as Error).message, tErrors));
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [itemId, fetchDetail, tErrors]);

  const handleDownloadPdf = async () => {
    if (!item || !item.year || !item.month) return;
    try {
      setIsDownloading(true);
      const blob = await downloadPdf(item.id);

      const filename = formatPayslipFilename(
        {
          year: item.year,
          month: item.month,
          paidAt: item.paidAt || new Date().toISOString(),
          employeeCode: item.employeeCode,
        },
        locale,
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(t("messages.exportSuccess"));
    } catch (error) {
      console.error("Download PDF error:", error);
      toast.error(t("downloadPdfError"));
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-muted-foreground">{tCommon("loading")}</span>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-muted-foreground">{t("messages.notFound")}</span>
      </div>
    );
  }

  // Format period
  const formatPeriod = () => {
    if (!item.year || !item.month) return "-";
    const startDate = new Date(item.year, item.month - 1, 1);
    const endDate = new Date(item.year, item.month, 0);

    if (locale === "ja") {
      const startDay = startDate.getDate();
      const endDay = endDate.getDate();
      return `${item.month}月${String(startDay).padStart(2, "0")}日 ~ ${item.month}月${String(endDay).padStart(2, "0")}日`;
    } else {
      return `${formatDate(startDate.toISOString(), locale)} ~ ${formatDate(endDate.toISOString(), locale)}`;
    }
  };

  // Format overtime hours (HH:MM)
  const formatOvertimeHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${String(mins).padStart(2, "0")}`;
  };

  // Lấy label lương theo loại lương
  const getSalaryLabel = () => {
    switch (item.salaryType) {
      case "HOURLY":
        return t("card.hourlySalary");
      case "DAILY":
        return t("card.dailySalary");
      case "SHIFT_BASED":
        return t("card.shiftSalary");
      default:
        return t("card.baseSalary");
    }
  };

  const totalIncome =
    (item.calculatedBaseSalary || item.baseSalary || 0) +
    (item.allowanceDetails?.reduce((sum, a) => sum + (a.amount || 0), 0) || 0);

  const totalDeductions =
    item.deductionDetails?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;

  return (
    <div className="space-y-4">
      {/* Back button và Download button */}
      <div className="flex items-center justify-between">
        {showBackButton && <BackButton />}
        {!showBackButton && <div />}
        {item?.status === "CONFIRMED" && (
          <Button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? t("downloadingPdf") : t("downloadPdf")}
          </Button>
        )}
      </div>

      <div className="max-w-[300mm] mx-auto bg-white border p-4 sm:p-10 rounded-2xl shadow-md space-y-4 sm:space-y-6 print:p-0">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-6">
          {/* Left: Title, Period, Net Salary */}
          <div className="flex-1 space-y-2">
            <h1 className="font-bold text-base sm:text-lg">
              {item.year && item.month && item.paidAt
                ? (() => {
                    const title = formatPayslipFullTitle(
                      {
                        year: item.year,
                        month: item.month,
                        paidAt: item.paidAt,
                      },
                      locale,
                    );
                    const parts = title.split(" - ");
                    if (parts.length === 2) {
                      return (
                        <>
                          {parts[0]}
                          {/* Trên mobile xuống dòng, trên desktop giữ nguyên dấu - */}
                          <span className="hidden sm:inline"> - </span>
                          <br className="sm:hidden" />
                          {parts[1]}
                        </>
                      );
                    }
                    return title;
                  })()
                : "-"}
            </h1>
            <div className="space-y-2 sm:space-y-4">
              <p className="text-sm">
                {t("detail.period")}： {formatPeriod()}
              </p>
              <div>
                <span className="text-sm">{t("card.netSalary")}：</span>
                <CurrencyDisplay
                  amount={item.netSalary}
                  className="text-xl font-bold"
                />
              </div>
            </div>
          </div>

          {/* Right: Employee Info Card */}
          <div className="sm:min-w-64 shrink-0 border-2 px-4 py-2 space-y-1 sm:space-y-2 rounded-sm">
            <div className="font-bold text-base">{user?.companyName || ""}</div>
            <div className="text-muted-foreground text-xs">
              {t("card.employeeId")}: {item.employeeCode}
            </div>
            <div className="font-bold">{item.employeeName}</div>
          </div>
        </div>

        {/* 4 Column Grid - 2 cột trên mobile, 4 cột trên desktop */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {/* Column 1: Attendance */}
          <div className="border-2 rounded overflow-hidden">
            <div className="bg-gray-600 text-white px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-center">
              {t("card.attendance")}
            </div>
            <div className="p-2 sm:p-4 space-y-2 sm:space-y-3 lg:min-h-[350px]">
              <div className="flex justify-between text-xs sm:text-sm gap-1">
                <span>{t("card.workingDays")}</span>
                <span className="font-semibold text-right">
                  {item.workingDays || 0}
                </span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm gap-1">
                <span>{t("card.workingHours")}</span>
                <span className="font-semibold text-right">
                  {formatOvertimeHours(item.workingMinutes || 0)}
                </span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm gap-1">
                <span>{t("card.overtimeHours")}</span>
                <span className="font-semibold text-right">
                  {formatOvertimeHours(item.regularOvertimeMinutes || 0)}
                </span>
              </div>
              {/* Mức lương/giờ/ngày/ca */}
              {item.salaryType &&
                item.salaryType !== "MONTHLY" &&
                item.baseSalary > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm gap-1">
                    <span>
                      {item.salaryType === "HOURLY" && t("card.hourlyRate")}
                      {item.salaryType === "DAILY" && t("card.dailyRate")}
                      {item.salaryType === "SHIFT_BASED" && t("card.shiftRate")}
                    </span>
                    <CurrencyDisplay
                      amount={item.baseSalary}
                      className="font-semibold text-xs sm:text-sm text-right"
                    />
                  </div>
                )}
            </div>
          </div>

          {/* Column 2: Income */}
          <div className="border-2 rounded overflow-hidden">
            <div className="bg-gray-600 text-white px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-center">
              {t("card.earnings")}
            </div>
            <div className="p-2 sm:p-4 space-y-2 sm:space-y-3 lg:min-h-[350px] flex flex-col">
              <div className="flex justify-between text-xs sm:text-sm gap-1">
                <span>{getSalaryLabel()}</span>
                <CurrencyDisplay
                  amount={item.calculatedBaseSalary || item.baseSalary}
                  className="font-semibold text-xs sm:text-sm text-right"
                />
              </div>
              {item.allowanceDetails?.map((allowance, index) => (
                <div
                  key={index}
                  className="flex justify-between text-xs sm:text-sm gap-1"
                >
                  <span className="truncate">
                    {getItemName(allowance.code, allowance.name)}
                  </span>
                  <CurrencyDisplay
                    amount={allowance.amount}
                    className="font-semibold text-xs sm:text-sm shrink-0 text-right"
                  />
                </div>
              ))}
              <div className="flex-1" />
              <div className="flex justify-between text-xs sm:text-sm font-bold pt-2 border-t-2 border-gray-600">
                <span>{t("card.total")}</span>
                <CurrencyDisplay
                  amount={totalIncome}
                  className="font-bold text-xs sm:text-sm text-right"
                />
              </div>
            </div>
          </div>

          {/* Column 3: Deductions */}
          <div className="border-2 rounded overflow-hidden">
            <div className="bg-gray-600 text-white px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-center">
              {t("card.deductions")}
            </div>
            <div className="p-2 sm:p-4 space-y-2 sm:space-y-3 lg:min-h-[350px] flex flex-col">
              {item.deductionDetails?.map((deduction, index) => (
                <div
                  key={index}
                  className="flex justify-between text-xs sm:text-sm gap-1"
                >
                  <span className="truncate">
                    {getItemName(deduction.code, deduction.name)}
                  </span>
                  <CurrencyDisplay
                    amount={deduction.amount}
                    className="font-semibold text-xs sm:text-sm shrink-0 text-right"
                  />
                </div>
              ))}
              <div className="flex-1" />
              <div className="flex justify-between text-xs sm:text-sm font-bold pt-2 border-t-2 border-gray-600">
                <span>{t("card.total")}</span>
                <CurrencyDisplay
                  amount={totalDeductions}
                  className="font-bold text-xs sm:text-sm text-right"
                />
              </div>
            </div>
          </div>

          {/* Column 4: Other */}
          <div className="border-2 rounded overflow-hidden">
            <div className="bg-gray-600 text-white px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-center">
              {t("card.others")}
            </div>
            <div className="p-2 sm:p-4 space-y-2 sm:space-y-3">
              <div className="flex justify-between text-xs sm:text-sm gap-1">
                <span>{t("card.bankTransfer")}</span>
                <CurrencyDisplay
                  amount={item.netSalary}
                  className="font-bold text-xs sm:text-sm text-right"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {item.adjustmentReason && (
          <div className="border-2 rounded overflow-hidden">
            <div className="bg-gray-600 text-white px-3 py-2.5 text-sm font-semibold">
              {t("card.remarks")}
            </div>
            <div className="p-4">
              <p className="text-sm">{item.adjustmentReason}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
