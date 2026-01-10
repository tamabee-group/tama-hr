"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";

import { formatCurrency } from "@/lib/utils/format-currency";
import { OvertimeMultipliers } from "@/types/attendance-config";

interface OvertimeBreakdownProps {
  regularMinutes: number;
  regularOvertimeMinutes: number;
  nightMinutes: number;
  nightOvertimeMinutes: number;
  holidayMinutes?: number;
  holidayNightMinutes?: number;
  regularOvertimePay: number;
  nightWorkPay: number;
  nightOvertimePay: number;
  holidayOvertimePay?: number;
  holidayNightOvertimePay?: number;
  totalOvertimePay: number;
  multipliers?: OvertimeMultipliers;
}

/**
 * Component hiển thị chi tiết breakdown tăng ca trong payslip
 * Collapsible/expandable section với đầy đủ thông tin
 */
export function OvertimeBreakdown({
  regularMinutes,
  regularOvertimeMinutes,
  nightMinutes,
  nightOvertimeMinutes,
  holidayMinutes = 0,
  holidayNightMinutes = 0,
  regularOvertimePay,
  nightWorkPay,
  nightOvertimePay,
  holidayOvertimePay = 0,
  holidayNightOvertimePay = 0,
  totalOvertimePay,
  multipliers,
}: OvertimeBreakdownProps) {
  const t = useTranslations("payroll");
  const tSettings = useTranslations("settings");
  const [isOpen, setIsOpen] = useState(false);

  // Kiểm tra có overtime không
  const hasOvertime =
    regularOvertimeMinutes > 0 ||
    nightMinutes > 0 ||
    nightOvertimeMinutes > 0 ||
    holidayMinutes > 0 ||
    holidayNightMinutes > 0;

  // Format giờ từ phút
  const formatHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours}h`;
    return `${hours}h${mins}m`;
  };

  // Nếu không có overtime
  if (!hasOvertime) {
    return (
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t("breakdown.overtime")}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-4">
          <p className="text-muted-foreground text-sm">
            {tSettings("overtime.noOvertime")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="py-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t("breakdown.overtime")}
              </CardTitle>
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(totalOvertimePay)}
                </span>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Giờ làm việc thường */}
            <OvertimeRow
              label={tSettings("overtime.regularHours")}
              hours={formatHours(regularMinutes)}
              amount={null}
              multiplier={null}
            />

            <Separator />

            {/* Tăng ca thường */}
            {regularOvertimeMinutes > 0 && (
              <OvertimeRow
                label={t("breakdown.regularOvertime")}
                hours={formatHours(regularOvertimeMinutes)}
                amount={formatCurrency(regularOvertimePay)}
                multiplier={multipliers?.regularOvertime}
              />
            )}

            {/* Làm đêm */}
            {nightMinutes > 0 && (
              <OvertimeRow
                label={t("breakdown.nightWork")}
                hours={formatHours(nightMinutes)}
                amount={formatCurrency(nightWorkPay)}
                multiplier={multipliers?.nightWork}
              />
            )}

            {/* Tăng ca đêm */}
            {nightOvertimeMinutes > 0 && (
              <OvertimeRow
                label={t("breakdown.nightOvertime")}
                hours={formatHours(nightOvertimeMinutes)}
                amount={formatCurrency(nightOvertimePay)}
                multiplier={multipliers?.nightOvertime}
              />
            )}

            {/* Tăng ca ngày lễ */}
            {holidayMinutes > 0 && (
              <OvertimeRow
                label={t("breakdown.holidayOvertime")}
                hours={formatHours(holidayMinutes)}
                amount={formatCurrency(holidayOvertimePay)}
                multiplier={multipliers?.holidayOvertime}
              />
            )}

            {/* Tăng ca đêm ngày lễ */}
            {holidayNightMinutes > 0 && (
              <OvertimeRow
                label={t("breakdown.holidayNightOvertime")}
                hours={formatHours(holidayNightMinutes)}
                amount={formatCurrency(holidayNightOvertimePay)}
                multiplier={multipliers?.holidayNightOvertime}
              />
            )}

            <Separator />

            {/* Tổng */}
            <div className="flex justify-between items-center">
              <span className="font-semibold">
                {t("breakdown.totalOvertime")}
              </span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatCurrency(totalOvertimePay)}
              </span>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

/**
 * Component hiển thị một dòng overtime
 */
interface OvertimeRowProps {
  label: string;
  hours: string;
  amount: string | null;
  multiplier: number | null | undefined;
}

function OvertimeRow({ label, hours, amount, multiplier }: OvertimeRowProps) {
  const tSettings = useTranslations("settings");

  return (
    <div className="flex justify-between items-center">
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
        <span className="text-sm">{label}</span>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <span className="bg-muted px-2 py-0.5 rounded">{hours}</span>
          {multiplier && (
            <span className="text-xs">
              ×{multiplier.toFixed(2)} {tSettings("overtime.multiplier")}
            </span>
          )}
        </div>
      </div>
      {amount && <span className="font-medium tabular-nums">{amount}</span>}
    </div>
  );
}
