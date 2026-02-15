"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { GlassSection } from "@/app/[locale]/_components/_glass-style";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HelpLink } from "@/components/ui/help-link";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { TimePicker, TimePreset } from "@/components/ui/time-picker";
import { toast } from "sonner";
import {
  OvertimeConfig,
  LegalOvertimeMinimums,
} from "@/types/attendance-config";
import { companySettingsApi } from "@/lib/apis/company-settings-api";

import { OvertimePreview } from "./_overtime-preview";
import { MultiplierRow } from "./_overtime-table-row";

// Presets cho giờ đêm
const NIGHT_START_PRESETS: TimePreset[] = [
  { label: "21:00", value: "21:00" },
  { label: "22:00", value: "22:00" },
  { label: "23:00", value: "23:00" },
  { label: "00:00", value: "00:00" },
];

const NIGHT_END_PRESETS: TimePreset[] = [
  { label: "04:00", value: "04:00" },
  { label: "05:00", value: "05:00" },
  { label: "06:00", value: "06:00" },
  { label: "07:00", value: "07:00" },
];

interface OvertimeConfigFormProps {
  config: OvertimeConfig;
  onSaveSuccess: () => void;
  onChangesUpdate: (hasChanges: boolean) => void;
  setSaveHandler: (handler: () => Promise<void>) => void;
}

// Hệ số tăng ca tối thiểu theo luật
const LEGAL_MINIMUMS: LegalOvertimeMinimums = {
  ja: {
    regularOvertime: 1.25,
    nightWork: 1.25,
    nightOvertime: 1.5,
    holidayOvertime: 1.35,
    holidayNightOvertime: 1.6,
  },
  vi: {
    regularOvertime: 1.5,
    nightWork: 1.3,
    nightOvertime: 1.95,
    holidayOvertime: 2.0,
    holidayNightOvertime: 2.6,
  },
  default: {
    regularOvertime: 1.25,
    nightWork: 1.25,
    nightOvertime: 1.5,
    holidayOvertime: 1.35,
    holidayNightOvertime: 1.6,
  },
};

export function OvertimeConfigForm({
  config,
  onSaveSuccess,
  onChangesUpdate,
  setSaveHandler,
}: OvertimeConfigFormProps) {
  const t = useTranslations("companySettings");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const quickSelectLabel = tCommon("quickSelect");

  const [formData, setFormData] = useState<OvertimeConfig>({ ...config });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  // Lấy hệ số tối thiểu theo locale
  const getLegalMinimums = useCallback(() => {
    const localeKey =
      formData.locale === "ja" || formData.locale === "vi"
        ? formData.locale
        : "ja";
    return LEGAL_MINIMUMS[localeKey];
  }, [formData.locale]);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    const minimums = getLegalMinimums();

    if (!formData.useLegalMinimum) {
      if (formData.regularOvertimeRate < minimums.regularOvertime) {
        newErrors.regularOvertimeRate = t("overtime.validationBelowMinimum", {
          min: minimums.regularOvertime.toFixed(2),
        });
      }
      if (formData.nightWorkRate < minimums.nightWork) {
        newErrors.nightWorkRate = t("overtime.validationBelowMinimum", {
          min: minimums.nightWork.toFixed(2),
        });
      }
      if (formData.nightOvertimeRate < minimums.nightOvertime) {
        newErrors.nightOvertimeRate = t("overtime.validationBelowMinimum", {
          min: minimums.nightOvertime.toFixed(2),
        });
      }
      if (formData.holidayOvertimeRate < minimums.holidayOvertime) {
        newErrors.holidayOvertimeRate = t("overtime.validationBelowMinimum", {
          min: minimums.holidayOvertime.toFixed(2),
        });
      }
      if (formData.holidayNightOvertimeRate < minimums.holidayNightOvertime) {
        newErrors.holidayNightOvertimeRate = t(
          "overtime.validationBelowMinimum",
          { min: minimums.holidayNightOvertime.toFixed(2) },
        );
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, getLegalMinimums, t]);

  // Hàm save để parent gọi
  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      toast.error(tCommon("checkInfo"));
      return;
    }

    try {
      await companySettingsApi.updateOvertimeConfig(formData);
      toast.success(tCommon("updateSuccess"));
      onSaveSuccess();
    } catch (error) {
      console.error("Failed to update overtime config:", error);
      toast.error(tCommon("updateError"));
    }
  }, [formData, validateForm, tCommon, onSaveSuccess]);

  // Đăng ký save handler với parent
  useEffect(() => {
    setSaveHandler(handleSave);
  }, [handleSave, setSaveHandler]);

  const updateField = <K extends keyof OvertimeConfig>(
    field: K,
    value: OvertimeConfig[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Khi bật useLegalMinimum, tự động set các giá trị theo legal minimum
  const handleUseLegalMinimumChange = (checked: boolean) => {
    updateField("useLegalMinimum", checked);
    if (checked) {
      const minimums = getLegalMinimums();
      setFormData((prev) => ({
        ...prev,
        useLegalMinimum: true,
        regularOvertimeRate: minimums.regularOvertime,
        nightWorkRate: minimums.nightWork,
        nightOvertimeRate: minimums.nightOvertime,
        holidayOvertimeRate: minimums.holidayOvertime,
        holidayNightOvertimeRate: minimums.holidayNightOvertime,
      }));
      setErrors({});
    }
  };

  // Khi đổi locale, cập nhật legal minimums nếu đang dùng legal minimum
  const handleLocaleChange = (value: string) => {
    updateField("locale", value);
    if (formData.useLegalMinimum) {
      const localeKey = value === "ja" || value === "vi" ? value : "ja";
      const minimums = LEGAL_MINIMUMS[localeKey as keyof typeof LEGAL_MINIMUMS];
      setFormData((prev) => ({
        ...prev,
        locale: value,
        regularOvertimeRate: minimums.regularOvertime,
        nightWorkRate: minimums.nightWork,
        nightOvertimeRate: minimums.nightOvertime,
        holidayOvertimeRate: minimums.holidayOvertime,
        holidayNightOvertimeRate: minimums.holidayNightOvertime,
      }));
    }
  };

  const minimums = getLegalMinimums();

  return (
    <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
      {/* Cột 1 */}
      <div className="space-y-6">
        {/* Bật/tắt tăng ca */}
        <GlassSection title={t("overtime.general")}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch
                id="overtimeEnabled"
                checked={formData.overtimeEnabled}
                onCheckedChange={(checked) =>
                  updateField("overtimeEnabled", checked)
                }
              />
              <Label htmlFor="overtimeEnabled" className="cursor-pointer">
                {t("overtime.overtimeEnabled")}
              </Label>
            </div>

            {formData.overtimeEnabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="standardWorkingHours">
                    {t("overtime.standardWorkingHours")}
                  </Label>
                  <InputGroup>
                    <InputGroupInput
                      id="standardWorkingHours"
                      type="number"
                      min={1}
                      max={24}
                      value={formData.standardWorkingHours}
                      onChange={(e) =>
                        updateField(
                          "standardWorkingHours",
                          parseInt(e.target.value) || 8,
                        )
                      }
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>{tCommon("hours")}</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    id="requireApproval"
                    checked={formData.requireApproval}
                    onCheckedChange={(checked) =>
                      updateField("requireApproval", checked)
                    }
                  />
                  <Label htmlFor="requireApproval" className="cursor-pointer">
                    {t("overtime.requireApproval")}
                  </Label>
                </div>
              </>
            )}
          </div>
        </GlassSection>

        {formData.overtimeEnabled && (
          <>
            {/* Cấu hình giờ đêm */}
            <GlassSection title={t("overtime.nightShift")}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nightStartTime">
                    {t("overtime.nightStartTime")}
                  </Label>
                  <TimePicker
                    id="nightStartTime"
                    value={formData.nightStartTime}
                    onChange={(value) => updateField("nightStartTime", value)}
                    presets={NIGHT_START_PRESETS}
                    quickSelectLabel={quickSelectLabel}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nightEndTime">
                    {t("overtime.nightEndTime")}
                  </Label>
                  <TimePicker
                    id="nightEndTime"
                    value={formData.nightEndTime}
                    onChange={(value) => updateField("nightEndTime", value)}
                    presets={NIGHT_END_PRESETS}
                    quickSelectLabel={quickSelectLabel}
                  />
                </div>
              </div>
            </GlassSection>

            {/* Giới hạn tăng ca */}
            <GlassSection title={t("overtime.limits")}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxOvertimeHoursPerDay">
                    {t("overtime.perDay")}
                  </Label>
                  <InputGroup>
                    <InputGroupInput
                      id="maxOvertimeHoursPerDay"
                      type="number"
                      min={0}
                      max={24}
                      value={formData.maxOvertimeHoursPerDay}
                      onChange={(e) =>
                        updateField(
                          "maxOvertimeHoursPerDay",
                          parseInt(e.target.value) || 0,
                        )
                      }
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>{tCommon("hours")}</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxOvertimeHoursPerMonth">
                    {t("overtime.perMonth")}
                  </Label>
                  <InputGroup>
                    <InputGroupInput
                      id="maxOvertimeHoursPerMonth"
                      type="number"
                      min={0}
                      max={744}
                      value={formData.maxOvertimeHoursPerMonth}
                      onChange={(e) =>
                        updateField(
                          "maxOvertimeHoursPerMonth",
                          parseInt(e.target.value) || 0,
                        )
                      }
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>{tCommon("hours")}</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
              </div>
            </GlassSection>
          </>
        )}
      </div>

      {/* Cột 2 */}
      <div className="space-y-6">
        {formData.overtimeEnabled && (
          <>
            {/* Cấu hình hệ số tăng ca */}
            <GlassSection title={t("overtime.multipliers")}>
              <div className="space-y-4">
                {/* Row 1: Sử dụng theo luật + Khu vực */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                  <div className="flex items-center gap-3">
                    <Switch
                      id="useLegalMinimum"
                      checked={formData.useLegalMinimum}
                      onCheckedChange={handleUseLegalMinimumChange}
                    />
                    <Label htmlFor="useLegalMinimum" className="cursor-pointer">
                      {t("overtime.useLegalMinimum")}
                    </Label>
                  </div>

                  <Select
                    value={formData.locale}
                    onValueChange={handleLocaleChange}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ja">{tEnums("locale.ja")}</SelectItem>
                      <SelectItem value="vi">{tEnums("locale.vi")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Link đến help */}
                <HelpLink
                  topic="company_settings"
                  article="overtime_settings"
                />

                {/* Bảng hệ số */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium">
                          {t("overtime.multiplierType")}
                        </th>
                        <th className="text-center px-3 py-2 font-medium w-24">
                          {t("overtime.legalMin")}
                        </th>
                        <th className="text-center px-3 py-2 font-medium w-28">
                          {t("overtime.multiplierValue")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <MultiplierRow
                        label={t("overtime.regularOvertimeRate")}
                        legalMin={minimums.regularOvertime}
                        value={formData.regularOvertimeRate}
                        onChange={(v) => updateField("regularOvertimeRate", v)}
                        disabled={formData.useLegalMinimum}
                        error={errors.regularOvertimeRate}
                      />
                      <MultiplierRow
                        label={t("overtime.nightWorkRate")}
                        legalMin={minimums.nightWork}
                        value={formData.nightWorkRate}
                        onChange={(v) => updateField("nightWorkRate", v)}
                        disabled={formData.useLegalMinimum}
                        error={errors.nightWorkRate}
                      />
                      <MultiplierRow
                        label={t("overtime.nightOvertimeRate")}
                        legalMin={minimums.nightOvertime}
                        value={formData.nightOvertimeRate}
                        onChange={(v) => updateField("nightOvertimeRate", v)}
                        disabled={formData.useLegalMinimum}
                        error={errors.nightOvertimeRate}
                      />
                      <MultiplierRow
                        label={t("overtime.holidayOvertimeRate")}
                        legalMin={minimums.holidayOvertime}
                        value={formData.holidayOvertimeRate}
                        onChange={(v) => updateField("holidayOvertimeRate", v)}
                        disabled={formData.useLegalMinimum}
                        error={errors.holidayOvertimeRate}
                      />
                      <MultiplierRow
                        label={t("overtime.holidayNightOvertimeRate")}
                        legalMin={minimums.holidayNightOvertime}
                        value={formData.holidayNightOvertimeRate}
                        onChange={(v) =>
                          updateField("holidayNightOvertimeRate", v)
                        }
                        disabled={formData.useLegalMinimum}
                        error={errors.holidayNightOvertimeRate}
                      />
                    </tbody>
                  </table>
                </div>
              </div>
            </GlassSection>

            {/* Preview section */}
            <OvertimePreview config={formData} />
          </>
        )}
      </div>
    </div>
  );
}
