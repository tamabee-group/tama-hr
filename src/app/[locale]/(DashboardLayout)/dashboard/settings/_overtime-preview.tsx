"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { OvertimeConfig } from "@/types/attendance-config";
import { formatCurrency } from "@/lib/utils/format-currency";
import { PreviewRow } from "./_overtime-table-row";

interface OvertimePreviewProps {
  config: OvertimeConfig;
}

/**
 * Component hiển thị preview tính toán tăng ca mẫu
 * Cho phép nhập hourly rate và hiển thị breakdown theo từng loại tăng ca
 */
export function OvertimePreview({ config }: OvertimePreviewProps) {
  const t = useTranslations("companySettings.overtime");
  const tCommon = useTranslations("common");

  // Mặc định hourly rate = 1000 JPY
  const [hourlyRate, setHourlyRate] = useState(1000);
  // Số giờ mẫu cho mỗi loại
  const sampleHours = 2;

  // Tính toán tiền tăng ca cho mỗi loại
  const calculations = [
    {
      label: t("regularOvertimeRate"),
      rate: config.regularOvertimeRate,
      hours: sampleHours,
      amount: formatCurrency(
        hourlyRate * config.regularOvertimeRate * sampleHours,
      ),
    },
    {
      label: t("nightWorkRate"),
      rate: config.nightWorkRate,
      hours: sampleHours,
      amount: formatCurrency(hourlyRate * config.nightWorkRate * sampleHours),
    },
    {
      label: t("nightOvertimeRate"),
      rate: config.nightOvertimeRate,
      hours: sampleHours,
      amount: formatCurrency(
        hourlyRate * config.nightOvertimeRate * sampleHours,
      ),
    },
    {
      label: t("holidayOvertimeRate"),
      rate: config.holidayOvertimeRate,
      hours: sampleHours,
      amount: formatCurrency(
        hourlyRate * config.holidayOvertimeRate * sampleHours,
      ),
    },
    {
      label: t("holidayNightOvertimeRate"),
      rate: config.holidayNightOvertimeRate,
      hours: sampleHours,
      amount: formatCurrency(
        hourlyRate * config.holidayNightOvertimeRate * sampleHours,
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("preview")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input hourly rate */}
        <div className="space-y-2">
          <Label htmlFor="hourlyRate">{t("sampleHourlyRate")}</Label>
          <Input
            id="hourlyRate"
            type="number"
            min={0}
            value={hourlyRate}
            onChange={(e) => setHourlyRate(parseInt(e.target.value) || 0)}
            className="max-w-[200px]"
          />
        </div>

        {/* Bảng tính toán */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-2">{t("overtimeType")}</th>
                <th className="text-right p-2">{t("hours")}</th>
                <th className="text-right p-2">{t("multiplier")}</th>
                <th className="text-right p-2">{tCommon("amount")}</th>
              </tr>
            </thead>
            <tbody>
              {calculations.map((calc, index) => (
                <PreviewRow
                  key={index}
                  label={calc.label}
                  hours={calc.hours}
                  rate={calc.rate}
                  amount={calc.amount}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Ghi chú */}
        <p className="text-xs text-muted-foreground">{t("previewNote")}</p>
      </CardContent>
    </Card>
  );
}
