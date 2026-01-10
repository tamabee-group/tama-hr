"use client";

import { useTranslations, useLocale } from "next-intl";
import { FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PayrollStatusBadge, PaymentStatusBadge } from "./_status-badge";
import { CurrencyDisplay } from "./_currency-display";
import { PayrollRecord } from "@/types/attendance-records";
import { SupportedLocale } from "@/lib/utils/format-currency";

interface PayslipListProps {
  payslips: PayrollRecord[];
  onViewDetail: (payslip: PayrollRecord) => void;
}

/**
 * Shared component hiển thị danh sách payslip dạng table compact
 * Dùng cho employee detail overview
 */
export function PayslipList({ payslips, onViewDetail }: PayslipListProps) {
  const t = useTranslations("payroll");
  const tCommon = useTranslations("common");
  const locale = useLocale() as SupportedLocale;

  // Format period display
  const formatPeriod = (year: number, month: number) => {
    if (locale === "ja") {
      return `${year}年${month}月`;
    }
    return `${month}/${year}`;
  };

  if (payslips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <FileText className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          {t("messages.noPayslip")}
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">{t("table.period")}</TableHead>
          <TableHead>{tCommon("status")}</TableHead>
          <TableHead className="text-right">
            {t("breakdown.netSalary")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payslips.map((payslip) => (
          <TableRow
            key={payslip.id}
            className="cursor-pointer"
            onClick={() => onViewDetail(payslip)}
          >
            <TableCell className="font-medium">
              {formatPeriod(payslip.year, payslip.month)}
            </TableCell>
            <TableCell>
              {/* Nếu đã thanh toán thì chỉ hiện PaymentStatus */}
              {payslip.paymentStatus === "PAID" ? (
                <PaymentStatusBadge status={payslip.paymentStatus} />
              ) : (
                <div className="flex gap-1">
                  <PayrollStatusBadge status={payslip.status} />
                  <PaymentStatusBadge status={payslip.paymentStatus} />
                </div>
              )}
            </TableCell>
            <TableCell className="text-right">
              <CurrencyDisplay
                amount={payslip.netSalary}
                className="font-semibold text-green-600"
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
