"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { GlassSection } from "@/app/[locale]/_components/_glass-style";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { PayrollConfig } from "@/types/attendance-config";
import { SALARY_TYPES, SalaryType } from "@/types/attendance-enums";
import { companySettingsApi } from "@/lib/apis/company-settings-api";

interface PayrollConfigFormProps {
  config: PayrollConfig;
  onSaveSuccess: () => void;
  onChangesUpdate: (hasChanges: boolean) => void;
  setSaveHandler: (handler: () => Promise<void>) => void;
}

export function PayrollConfigForm({
  config,
  onSaveSuccess,
  onChangesUpdate,
  setSaveHandler,
}: PayrollConfigFormProps) {
  const t = useTranslations("companySettings");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");

  const [formData, setFormData] = useState<PayrollConfig>({ ...config });

  // Đồng bộ formData khi config prop thay đổi (sau khi save + reload)
  useEffect(() => {
    setFormData({ ...config }); // eslint-disable-line react-hooks/set-state-in-effect
  }, [config]);

  // Kiểm tra có thay đổi không
  const hasChanges = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(config);
  }, [formData, config]);

  // Cập nhật hasChanges lên parent
  useEffect(() => {
    onChangesUpdate(hasChanges);
  }, [hasChanges, onChangesUpdate]);

  // Hàm save để parent gọi
  const handleSave = useCallback(async () => {
    try {
      await companySettingsApi.updatePayrollConfig(formData);
      toast.success(tCommon("updateSuccess"));
      onSaveSuccess();
    } catch (error) {
      console.error("Failed to update payroll config:", error);
      toast.error(tCommon("updateError"));
    }
  }, [formData, tCommon, onSaveSuccess]);

  // Đăng ký save handler với parent
  useEffect(() => {
    setSaveHandler(handleSave);
  }, [handleSave, setSaveHandler]);

  const updateField = <K extends keyof PayrollConfig>(
    field: K,
    value: PayrollConfig[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Tạo options cho ngày trong tháng
  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
      {/* Cột 1: Loại lương + Ngày thanh toán */}
      <div className="space-y-6">
        {/* Cấu hình loại lương */}
        <GlassSection title={t("payroll.salaryType")}>
          <div className="space-y-2">
            <Label>{t("payroll.defaultSalaryType")}</Label>
            <Select
              value={formData.defaultSalaryType}
              onValueChange={(value) =>
                updateField("defaultSalaryType", value as SalaryType)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SALARY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {tEnums(`salaryType.${type}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </GlassSection>

        {/* Cấu hình ngày thanh toán */}
        <GlassSection title={t("payroll.paymentSchedule")}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payDay" className="flex items-center gap-2">
                {t("payroll.payDay")}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{t("payroll.payDayTooltip")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Select
                value={String(formData.payDay)}
                onValueChange={(value) =>
                  updateField("payDay", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dayOptions.map((day) => (
                    <SelectItem key={day} value={String(day)}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cutoffDay" className="flex items-center gap-2">
                {t("payroll.cutoffDay")}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        {t("payroll.cutoffDayTooltip")}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Select
                value={String(formData.cutoffDay)}
                onValueChange={(value) =>
                  updateField("cutoffDay", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dayOptions.map((day) => (
                    <SelectItem key={day} value={String(day)}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </GlassSection>
      </div>

      {/* Cột 2: Ngày công chuẩn */}
      <div className="space-y-6">
        <GlassSection title={t("payroll.standardWorking")}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="standardWorkingDaysPerMonth">
                {t("payroll.daysPerMonth")}
              </Label>
              <InputGroup>
                <InputGroupInput
                  id="standardWorkingDaysPerMonth"
                  type="number"
                  min={1}
                  max={31}
                  value={formData.standardWorkingDaysPerMonth}
                  onChange={(e) =>
                    updateField(
                      "standardWorkingDaysPerMonth",
                      parseInt(e.target.value) || 22,
                    )
                  }
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>{t("payroll.days")}</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="standardWorkingHoursPerDay">
                {t("payroll.hoursPerDay")}
              </Label>
              <InputGroup>
                <InputGroupInput
                  id="standardWorkingHoursPerDay"
                  type="number"
                  min={1}
                  max={24}
                  value={formData.standardWorkingHoursPerDay}
                  onChange={(e) =>
                    updateField(
                      "standardWorkingHoursPerDay",
                      parseInt(e.target.value) || 8,
                    )
                  }
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>{t("payroll.hours")}</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>
        </GlassSection>
      </div>
    </div>
  );
}
