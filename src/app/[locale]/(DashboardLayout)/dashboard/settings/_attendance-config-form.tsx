"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { GlassSection } from "@/app/[locale]/_components/_glass-style";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { HelpLink } from "@/components/ui/help-link";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { TimePicker } from "@/components/ui/time-picker";
import { toast } from "sonner";
import { AttendanceConfig, BreakConfig } from "@/types/attendance-config";
import { companySettingsApi } from "@/lib/apis/company-settings-api";
import { BreakSection } from "./_break-section";
import { RoundingSection } from "./_rounding-section";

interface AttendanceConfigFormProps {
  config: AttendanceConfig;
  breakConfig: BreakConfig;
  onSaveSuccess: () => void;
  onChangesUpdate: (hasChanges: boolean) => void;
  setSaveHandler: (handler: () => Promise<void>) => void;
}

export function AttendanceConfigForm({
  config,
  breakConfig,
  onSaveSuccess,
  onChangesUpdate,
  setSaveHandler,
}: AttendanceConfigFormProps) {
  const t = useTranslations("companySettings");
  const tCommon = useTranslations("common");
  const quickSelectLabel = tCommon("quickSelect");

  const [formData, setFormData] = useState<AttendanceConfig>({ ...config });
  const [breakFormData, setBreakFormData] = useState<BreakConfig>({
    ...breakConfig,
  });

  // Đồng bộ formData khi config prop thay đổi (sau khi save + reload)
  useEffect(() => {
    setFormData({ ...config }); // eslint-disable-line react-hooks/set-state-in-effect
  }, [config]);

  useEffect(() => {
    setBreakFormData({ ...breakConfig }); // eslint-disable-line react-hooks/set-state-in-effect
  }, [breakConfig]);

  // Kiểm tra có thay đổi không
  const hasChanges = useMemo(() => {
    const attendanceChanged =
      JSON.stringify(formData) !== JSON.stringify(config);
    const breakChanged =
      JSON.stringify(breakFormData) !== JSON.stringify(breakConfig);
    return attendanceChanged || breakChanged;
  }, [formData, config, breakFormData, breakConfig]);

  // Cập nhật hasChanges lên parent
  useEffect(() => {
    onChangesUpdate(hasChanges);
  }, [hasChanges, onChangesUpdate]);

  // Hàm save để parent gọi
  const handleSave = useCallback(async () => {
    try {
      await Promise.all([
        companySettingsApi.updateAttendanceConfig(formData),
        companySettingsApi.updateBreakConfig(breakFormData),
      ]);
      toast.success(tCommon("updateSuccess"));
      onSaveSuccess();
    } catch (error) {
      console.error("Failed to update config:", error);
      toast.error(tCommon("updateError"));
    }
  }, [formData, breakFormData, tCommon, onSaveSuccess]);

  // Đăng ký save handler với parent
  useEffect(() => {
    setSaveHandler(handleSave);
  }, [handleSave, setSaveHandler]);

  const updateField = <K extends keyof AttendanceConfig>(
    field: K,
    value: AttendanceConfig[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateBreakField = <K extends keyof BreakConfig>(
    field: K,
    value: BreakConfig[K],
  ) => {
    setBreakFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
        {/* Cột 1 */}
        <div className="space-y-6">
          {/* Giờ làm việc mặc định */}
          <GlassSection title={t("attendance.workingHours")}>
            <div className="space-y-4">
              {/* Row 1: Giờ bắt đầu, kết thúc, nghỉ */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultWorkStartTime">
                    {t("attendance.defaultWorkStartTime")}
                  </Label>
                  <TimePicker
                    id="defaultWorkStartTime"
                    value={formData.defaultWorkStartTime}
                    onChange={(value) =>
                      updateField("defaultWorkStartTime", value)
                    }
                    quickSelectLabel={quickSelectLabel}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultWorkEndTime">
                    {t("attendance.defaultWorkEndTime")}
                  </Label>
                  <TimePicker
                    id="defaultWorkEndTime"
                    value={formData.defaultWorkEndTime}
                    onChange={(value) =>
                      updateField("defaultWorkEndTime", value)
                    }
                    quickSelectLabel={quickSelectLabel}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultBreakMinutes">
                    {t("attendance.breakTime")}
                  </Label>
                  <InputGroup>
                    <InputGroupInput
                      id="defaultBreakMinutes"
                      type="number"
                      min={0}
                      max={480}
                      value={formData.defaultBreakMinutes}
                      onChange={(e) =>
                        updateField(
                          "defaultBreakMinutes",
                          parseInt(e.target.value),
                        )
                      }
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>{tCommon("minutes")}</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
              </div>

              {/* Row 2: Thời gian cho phép đi muộn/về sớm */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lateGraceMinutes">
                    {t("attendance.lateGraceMinutes")}
                  </Label>
                  <InputGroup>
                    <InputGroupInput
                      id="lateGraceMinutes"
                      type="number"
                      min={0}
                      max={60}
                      value={formData.lateGraceMinutes}
                      onChange={(e) =>
                        updateField(
                          "lateGraceMinutes",
                          parseInt(e.target.value),
                        )
                      }
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>{tCommon("minutes")}</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="earlyLeaveGraceMinutes">
                    {t("attendance.earlyLeaveGraceMinutes")}
                  </Label>
                  <InputGroup>
                    <InputGroupInput
                      id="earlyLeaveGraceMinutes"
                      type="number"
                      min={0}
                      max={60}
                      value={formData.earlyLeaveGraceMinutes}
                      onChange={(e) =>
                        updateField(
                          "earlyLeaveGraceMinutes",
                          parseInt(e.target.value),
                        )
                      }
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>{tCommon("minutes")}</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
              </div>

              {/* Link đến help cho thời gian cho phép */}
              <HelpLink
                topic="company_settings"
                article="attendance_settings"
              />
            </div>
          </GlassSection>

          {/* Phương thức chấm công */}
          <GlassSection title={t("attendance.checkInMethod")}>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t("attendance.checkInMethodDesc")}
              </p>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3">
                  <Switch
                    id="allowMobileCheckIn"
                    checked={formData.allowMobileCheckIn}
                    onCheckedChange={(checked) =>
                      updateField("allowMobileCheckIn", checked)
                    }
                  />
                  <Label
                    htmlFor="allowMobileCheckIn"
                    className="cursor-pointer"
                  >
                    {t("attendance.allowMobileCheckIn")}
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    id="allowWebCheckIn"
                    checked={formData.allowWebCheckIn}
                    onCheckedChange={(checked) =>
                      updateField("allowWebCheckIn", checked)
                    }
                  />
                  <Label htmlFor="allowWebCheckIn" className="cursor-pointer">
                    {t("attendance.allowWebCheckIn")}
                  </Label>
                </div>
              </div>

              <HelpLink
                topic="company_settings"
                article="attendance_settings"
              />
            </div>
          </GlassSection>

          {/* Cấu hình nghỉ cuối tuần và ngày lễ */}
          <GlassSection title={t("attendance.weekendHolidayOff")}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3">
                  <Switch
                    id="saturdayOff"
                    checked={formData.saturdayOff}
                    onCheckedChange={(checked) =>
                      updateField("saturdayOff", checked)
                    }
                  />
                  <Label htmlFor="saturdayOff" className="cursor-pointer">
                    {t("attendance.saturdayOff")}
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    id="sundayOff"
                    checked={formData.sundayOff}
                    onCheckedChange={(checked) =>
                      updateField("sundayOff", checked)
                    }
                  />
                  <Label htmlFor="sundayOff" className="cursor-pointer">
                    {t("attendance.sundayOff")}
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    id="holidayOff"
                    checked={formData.holidayOff}
                    onCheckedChange={(checked) =>
                      updateField("holidayOff", checked)
                    }
                  />
                  <Label htmlFor="holidayOff" className="cursor-pointer">
                    {t("attendance.holidayOff")}
                  </Label>
                </div>
              </div>
            </div>
          </GlassSection>
        </div>

        {/* Cột 2 */}
        <div className="space-y-6">
          {/* Cấu hình làm tròn thời gian */}
          <RoundingSection formData={formData} updateField={updateField} />
        </div>
      </div>

      {/* Cấu hình giờ giải lao */}
      <div className="mt-6">
        <BreakSection config={breakFormData} onUpdate={updateBreakField} />
      </div>

      {/* Cấu hình vị trí chấm công */}
      <div className="mt-6">
        <GlassSection title={t("attendance.locationSettings")}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3">
                <Switch
                  id="requireGeoLocation"
                  checked={formData.requireGeoLocation}
                  onCheckedChange={(checked) =>
                    updateField("requireGeoLocation", checked)
                  }
                />
                <Label htmlFor="requireGeoLocation" className="cursor-pointer">
                  {t("attendance.requireGeoLocation")}
                </Label>
              </div>
            </div>

            {/* Bán kính mặc định (chỉ hiện khi bật GPS) */}
            {formData.requireGeoLocation && (
              <div className="space-y-2">
                <Label htmlFor="geoFenceRadiusMeters">
                  {t("attendance.geoFenceRadiusMeters")}
                </Label>
                <InputGroup className="max-w-[240px]">
                  <InputGroupInput
                    id="geoFenceRadiusMeters"
                    type="number"
                    min={0}
                    max={10000}
                    value={formData.geoFenceRadiusMeters}
                    onChange={(e) =>
                      updateField(
                        "geoFenceRadiusMeters",
                        parseInt(e.target.value),
                      )
                    }
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>m</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                <p className="text-xs text-muted-foreground">
                  {t("attendance.geoFenceRadiusMetersDesc")}
                </p>
              </div>
            )}

            <HelpLink topic="company_settings" article="attendance_settings" />
          </div>
        </GlassSection>
      </div>
    </>
  );
}
