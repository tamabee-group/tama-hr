"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";

import { PayrollItem } from "@/types/attendance-records";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { SupportedLocale } from "@/lib/utils/format-currency";
import { formatPayslipFullTitle } from "@/lib/utils/format-payslip";

interface GroupedPayslips {
  year: number;
  items: PayrollItem[];
}

interface PayslipYearListProps {
  /** Hàm fetch danh sách payslips */
  fetchPayslips: () => Promise<PayrollItem[]>;
  /** Hàm xử lý khi click vào payslip item */
  onItemClick: (payslip: PayrollItem) => void;
}

/**
 * Component hiển thị danh sách payslip group theo năm, có thể expand/collapse
 * Dùng chung cho cả employee portal (/me/payroll) và admin (/dashboard/employees/[id])
 */
export function PayslipYearList({
  fetchPayslips,
  onItemClick,
}: PayslipYearListProps) {
  const t = useTranslations("payroll");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;

  const [payslips, setPayslips] = useState<PayrollItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());

  const loadPayslips = useCallback(async () => {
    setLoading(true);
    try {
      const items = await fetchPayslips();
      setPayslips(items);

      // Mặc định expand năm đầu tiên
      if (items.length > 0) {
        const firstYear = items[0].year;
        if (firstYear) {
          setExpandedYears(new Set([firstYear]));
        }
      }
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoading(false);
    }
  }, [fetchPayslips, tErrors]);

  useEffect(() => {
    loadPayslips();
  }, [loadPayslips]);

  // Group payslips theo năm
  const groupedPayslips: GroupedPayslips[] = payslips.reduce((acc, item) => {
    if (!item.year) return acc;
    const existingGroup = acc.find((g) => g.year === item.year);
    if (existingGroup) {
      existingGroup.items.push(item);
    } else {
      acc.push({ year: item.year, items: [item] });
    }
    return acc;
  }, [] as GroupedPayslips[]);

  // Sort theo năm giảm dần
  groupedPayslips.sort((a, b) => b.year - a.year);

  const toggleYear = (year: number) => {
    setExpandedYears((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(year)) {
        newSet.delete(year);
      } else {
        newSet.add(year);
      }
      return newSet;
    });
  };

  // Format title theo locale
  const formatTitle = (payslip: PayrollItem) => {
    if (!payslip.year || !payslip.month || !payslip.paidAt) return "-";
    return formatPayslipFullTitle(
      { year: payslip.year, month: payslip.month, paidAt: payslip.paidAt },
      locale,
    );
  };

  // Format year header (hiển thị Reiwa cho tiếng Nhật)
  const formatYearHeader = (year: number) => {
    if (locale === "ja") {
      const reiwaYear = year - 2018;
      return `${year}（令和${String(reiwaYear).padStart(2, "0")}年）`;
    }
    return year.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-muted-foreground">{t("messages.loading")}</span>
      </div>
    );
  }

  if (payslips.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-muted-foreground">{t("messages.noPayslip")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-0 border rounded-lg overflow-hidden">
      {groupedPayslips.map((group) => (
        <div key={group.year}>
          {/* Year Header - Collapsible */}
          <button
            onClick={() => toggleYear(group.year)}
            className="w-full flex items-center justify-between px-4 py-2 bg-muted hover:bg-muted/80 transition-colors border-b"
          >
            <span className="font-medium text-lg">
              {formatYearHeader(group.year)}
            </span>
            {expandedYears.has(group.year) ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {/* Payslip Items */}
          {expandedYears.has(group.year) && (
            <div>
              {group.items.map((payslip) => (
                <button
                  key={payslip.id}
                  onClick={() => onItemClick(payslip)}
                  className="w-full flex items-center justify-between px-4 py-2 hover:cursor-pointer transition-colors text-left border-b last:border-b-0"
                >
                  <span className="text-primary border-b border-transparent hover:border-primary">
                    {formatTitle(payslip)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
