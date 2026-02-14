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
import { PayrollItemStatusBadge } from "@/app/[locale]/_components/_shared/display/_status-badge";

import { PayrollPreviewRecord } from "@/lib/apis/payroll-period-api";
import { formatPayslip } from "@/lib/utils/format-currency";
import { useAuth } from "@/hooks/use-auth";

// System item codes được tạo tự động bởi backend
const SYSTEM_ITEM_CODES = ["OVERTIME", "SHORTFALL"];

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
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuth();
  const companyLocale = user?.locale || "vi";

  if (!record) return null;

  // Lấy tên item, ưu tiên translation cho system items
  const getItemName = (code: string, name: string) => {
    if (SYSTEM_ITEM_CODES.includes(code)) {
      return t(`systemItems.${code}`);
    }
    return name;
  };

  // Handle view full detail page
  const handleViewFullDetail = () => {
    if (record.id) {
      router.push(`/${locale}/dashboard/payroll/records/${record.id}`);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex gap-4">
            {record.employeeName}
            <PayrollItemStatusBadge status={record.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 mt-4">
          {/* Lương cơ bản */}
          <div className="flex justify-between">
            <span>{t("breakdown.baseSalary")}</span>
            <span>{formatPayslip(record.baseSalary, companyLocale)}</span>
          </div>

          {/* Làm thêm giờ */}
          <div className="space-y-2">
            <BreakdownRow
              label={t("breakdown.regularOvertime")}
              value={record.regularOvertimePay}
              hours={Math.round((record.regularOvertimeMinutes || 0) / 60)}
              companyLocale={companyLocale}
            />
            {/* Night Work removed as it's not in PayrollItem */}
            <BreakdownRow
              label={t("breakdown.nightOvertime")}
              value={record.nightOvertimePay}
              hours={Math.round((record.nightOvertimeMinutes || 0) / 60)}
              companyLocale={companyLocale}
            />
            {(record.holidayOvertimePay || 0) > 0 && (
              <BreakdownRow
                label={t("breakdown.holidayOvertime")}
                value={record.holidayOvertimePay}
                companyLocale={companyLocale}
              />
            )}
            <div className="flex justify-between">
              <span>{t("breakdown.totalOvertime")}</span>
              <span>
                {formatPayslip(record.totalOvertimePay || 0, companyLocale)}
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
                  label={getItemName(item.code, item.name)}
                  value={item.amount}
                  companyLocale={companyLocale}
                />
              ))
            ) : (
              <span className="text-muted-foreground text-sm">-</span>
            )}
            <div className="flex justify-between font-medium text-green-600">
              <span>{t("breakdown.totalAllowances")}</span>
              <span>
                {formatPayslip(record.totalAllowances || 0, companyLocale)}
              </span>
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
                  label={getItemName(item.code, item.name)}
                  value={-item.amount}
                  negative
                  companyLocale={companyLocale}
                />
              ))
            ) : (
              <span className="text-muted-foreground text-sm">-</span>
            )}
            <div className="flex justify-between font-medium text-red-600">
              <span>{t("breakdown.totalDeductions")}</span>
              <span>
                -{formatPayslip(record.totalDeductions || 0, companyLocale)}
              </span>
            </div>
          </div>

          <Separator />

          {/* Tổng cộng */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>{t("breakdown.grossSalary")}</span>
              <span className="font-medium">
                {formatPayslip(record.grossSalary || 0, companyLocale)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>{t("breakdown.netSalary")}</span>
              <span className="text-green-600">
                {formatPayslip(record.netSalary || 0, companyLocale)}
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
  hours?: number;
  negative?: boolean;
  companyLocale: string;
}

function BreakdownRow({
  label,
  value,
  hours,
  negative,
  companyLocale,
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
        {formatPayslip(Math.abs(value), companyLocale)}
      </span>
    </div>
  );
}
