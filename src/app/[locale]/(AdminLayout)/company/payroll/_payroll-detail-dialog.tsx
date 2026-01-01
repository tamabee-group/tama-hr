"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { PayrollStatusBadge } from "@/app/[locale]/_components/_shared/_status-badge";

import { PayrollPreviewRecord } from "@/lib/apis/payroll-api";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";

interface PayrollDetailDialogProps {
  record: PayrollPreviewRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog xem chi tiết lương
 * Hiển thị breakdown lương và nút xem chi tiết đầy đủ nếu có record
 */
export function PayrollDetailDialog({
  record,
  open,
  onOpenChange,
}: PayrollDetailDialogProps) {
  const t = useTranslations("payroll");
  const tCommon = useTranslations("common");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();

  if (!record) return null;

  // Handle view full detail page
  const handleViewFullDetail = () => {
    if (record.id) {
      router.push(`/${locale}/company/payroll/records/${record.id}`);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex gap-4">
            {record.employeeName}
            <PayrollStatusBadge status={record.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 mt-4">
          {/* Lương cơ bản */}
          <div className="flex justify-between">
            <span>{t("breakdown.baseSalary")}</span>
            <span>{formatCurrency(record.baseSalary, locale)}</span>
          </div>

          {/* Làm thêm giờ */}
          <div className="space-y-2">
            <BreakdownRow
              label={t("breakdown.regularOvertime")}
              value={record.regularOvertimePay}
              locale={locale}
              hours={Math.round((record.regularOvertimeMinutes || 0) / 60)}
            />
            <BreakdownRow
              label={t("breakdown.nightWork")}
              value={record.nightWorkPay}
              locale={locale}
              hours={Math.round((record.nightMinutes || 0) / 60)}
            />
            <BreakdownRow
              label={t("breakdown.nightOvertime")}
              value={record.nightOvertimePay}
              locale={locale}
              hours={Math.round((record.nightOvertimeMinutes || 0) / 60)}
            />
            {(record.holidayOvertimePay || 0) > 0 && (
              <BreakdownRow
                label={t("breakdown.holidayOvertime")}
                value={record.holidayOvertimePay}
                locale={locale}
              />
            )}
            <div className="flex justify-between">
              <span>{t("breakdown.totalOvertime")}</span>
              <span>
                {formatCurrency(record.totalOvertimePay || 0, locale)}
              </span>
            </div>
          </div>

          <Separator />

          {/* Phụ cấp */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">
              {t("breakdown.allowances")}
            </h4>
            {record.allowanceDetails?.length > 0 ? (
              record.allowanceDetails.map((item, index) => (
                <BreakdownRow
                  key={index}
                  label={item.name}
                  value={item.amount}
                  locale={locale}
                />
              ))
            ) : (
              <span className="text-muted-foreground text-sm">-</span>
            )}
            <div className="flex justify-between font-medium text-green-600">
              <span>{t("breakdown.totalAllowances")}</span>
              <span>{formatCurrency(record.totalAllowances || 0, locale)}</span>
            </div>
          </div>

          <Separator />

          {/* Khấu trừ */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">
              {t("breakdown.deductions")}
            </h4>
            {record.deductionDetails?.length > 0 ? (
              record.deductionDetails.map((item, index) => (
                <BreakdownRow
                  key={index}
                  label={item.name}
                  value={-item.amount}
                  locale={locale}
                  negative
                />
              ))
            ) : (
              <span className="text-muted-foreground text-sm">-</span>
            )}
            <div className="flex justify-between font-medium text-red-600">
              <span>{t("breakdown.totalDeductions")}</span>
              <span>
                -{formatCurrency(record.totalDeductions || 0, locale)}
              </span>
            </div>
          </div>

          <Separator />

          {/* Tổng cộng */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>{t("breakdown.grossSalary")}</span>
              <span className="font-medium">
                {formatCurrency(record.grossSalary || 0, locale)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>{t("breakdown.netSalary")}</span>
              <span className="text-green-600">
                {formatCurrency(record.netSalary || 0, locale)}
              </span>
            </div>
          </div>
        </div>

        {/* Chỉ hiển thị footer nếu có record id */}
        {record.id && (
          <DialogFooter>
            <Button onClick={handleViewFullDetail}>
              <ExternalLink className="h-4 w-4 mr-2" />
              {tCommon("details")}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Component hiển thị một dòng breakdown
 */
interface BreakdownRowProps {
  label: string;
  value: number;
  locale: SupportedLocale;
  hours?: number;
  negative?: boolean;
}

function BreakdownRow({
  label,
  value,
  locale,
  hours,
  negative,
}: BreakdownRowProps) {
  if (!value || value === 0) return null;

  return (
    <div className="flex justify-between text-sm">
      <span>
        {label}
        {hours !== undefined && hours > 0 && (
          <span className="text-muted-foreground ml-1">({hours}h)</span>
        )}
      </span>
      <span className={negative ? "text-red-600" : ""}>
        {negative ? "-" : ""}
        {formatCurrency(Math.abs(value), locale)}
      </span>
    </div>
  );
}
