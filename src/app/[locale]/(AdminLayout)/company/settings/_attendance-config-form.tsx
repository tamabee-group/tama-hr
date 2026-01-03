"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { AttendanceConfig, BreakConfig } from "@/types/attendance-config";
import {
  ROUNDING_INTERVALS,
  ROUNDING_DIRECTIONS,
  RoundingInterval,
  RoundingDirection,
} from "@/types/attendance-enums";
import { companySettingsApi } from "@/lib/apis/company-settings-api";
import { BreakSection } from "./_break-section";

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
  const tEnums = useTranslations("enums");

  const [formData, setFormData] = useState<AttendanceConfig>({ ...config });
  const [breakFormData, setBreakFormData] = useState<BreakConfig>({
    ...breakConfig,
  });

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
      // Save cả attendance config và break config
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
          {/* Giờ làm việc mặc định + Thời gian cho phép */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("attendance.workingHours")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Row 1: Giờ bắt đầu, kết thúc, nghỉ */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultWorkStartTime">
                    {t("attendance.defaultWorkStartTime")}
                  </Label>
                  <Input
                    id="defaultWorkStartTime"
                    type="time"
                    value={formData.defaultWorkStartTime}
                    onChange={(e) =>
                      updateField("defaultWorkStartTime", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultWorkEndTime">
                    {t("attendance.defaultWorkEndTime")}
                  </Label>
                  <Input
                    id="defaultWorkEndTime"
                    type="time"
                    value={formData.defaultWorkEndTime}
                    onChange={(e) =>
                      updateField("defaultWorkEndTime", e.target.value)
                    }
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
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="lateGraceMinutes"
                    className="flex items-center gap-2"
                  >
                    {t("attendance.lateGraceMinutes")}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            {t("attendance.lateGraceTooltip")}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
                  <Label
                    htmlFor="earlyLeaveGraceMinutes"
                    className="flex items-center gap-2"
                  >
                    {t("attendance.earlyLeaveGraceMinutes")}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            {t("attendance.earlyLeaveGraceTooltip")}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
            </CardContent>
          </Card>

          {/* Cấu hình thiết bị và vị trí */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("attendance.deviceLocation")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Row 1: Các toggle chính */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Switch
                    id="requireDeviceRegistration"
                    checked={formData.requireDeviceRegistration}
                    onCheckedChange={(checked) =>
                      updateField("requireDeviceRegistration", checked)
                    }
                  />
                  <Label
                    htmlFor="requireDeviceRegistration"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {t("attendance.requireDeviceRegistration")}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            {t("attendance.deviceRegistrationTooltip")}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    id="requireGeoLocation"
                    checked={formData.requireGeoLocation}
                    onCheckedChange={(checked) =>
                      updateField("requireGeoLocation", checked)
                    }
                  />
                  <Label
                    htmlFor="requireGeoLocation"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {t("attendance.requireGeoLocation")}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            {t("attendance.geoLocationTooltip")}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                </div>
              </div>

              {/* Bán kính GPS (chỉ hiện khi bật GPS) */}
              {formData.requireGeoLocation && (
                <div className="space-y-2">
                  <Label htmlFor="geoFenceRadiusMeters">
                    {t("attendance.geoFenceRadiusMeters")}
                  </Label>
                  <Input
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
                    className="max-w-[200px]"
                  />
                </div>
              )}

              {/* Row 2: Cho phép chấm công */}
              <div className="grid grid-cols-2 gap-4 pt-2">
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
            </CardContent>
          </Card>
        </div>

        {/* Cột 2 */}
        <div className="space-y-6">
          {/* Cấu hình làm tròn thời gian - Unified Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {t("attendance.rounding")}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        {t("attendance.roundingTooltip")}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Switch
                  id="enableRounding"
                  checked={formData.enableRounding}
                  onCheckedChange={(checked) =>
                    updateField("enableRounding", checked)
                  }
                />
                <Label htmlFor="enableRounding" className="cursor-pointer">
                  {t("attendance.rounding")}
                </Label>
              </div>

              {formData.enableRounding && (
                <div className="space-y-3 pt-2">
                  {/* Check-in Rounding */}
                  <div className="flex items-center gap-4 p-3 border rounded-lg">
                    <Switch
                      checked={formData.enableCheckInRounding}
                      onCheckedChange={(checked) =>
                        updateField("enableCheckInRounding", checked)
                      }
                    />
                    <span className="font-medium min-w-[100px]">
                      {t("attendance.checkInRounding")}
                    </span>
                    {formData.enableCheckInRounding && (
                      <div className="flex gap-2 flex-1">
                        <Select
                          value={
                            formData.checkInRounding?.interval || "MINUTES_15"
                          }
                          onValueChange={(value) =>
                            updateField("checkInRounding", {
                              interval: value as RoundingInterval,
                              direction:
                                formData.checkInRounding?.direction ||
                                "NEAREST",
                            })
                          }
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROUNDING_INTERVALS.map((interval) => (
                              <SelectItem key={interval} value={interval}>
                                {tEnums(`roundingInterval.${interval}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={
                            formData.checkInRounding?.direction || "NEAREST"
                          }
                          onValueChange={(value) =>
                            updateField("checkInRounding", {
                              interval:
                                formData.checkInRounding?.interval ||
                                "MINUTES_15",
                              direction: value as RoundingDirection,
                            })
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROUNDING_DIRECTIONS.map((direction) => (
                              <SelectItem key={direction} value={direction}>
                                {tEnums(`roundingDirection.${direction}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Check-out Rounding */}
                  <div className="flex items-center gap-4 p-3 border rounded-lg">
                    <Switch
                      checked={formData.enableCheckOutRounding}
                      onCheckedChange={(checked) =>
                        updateField("enableCheckOutRounding", checked)
                      }
                    />
                    <span className="font-medium min-w-[100px]">
                      {t("attendance.checkOutRounding")}
                    </span>
                    {formData.enableCheckOutRounding && (
                      <div className="flex gap-2 flex-1">
                        <Select
                          value={
                            formData.checkOutRounding?.interval || "MINUTES_15"
                          }
                          onValueChange={(value) =>
                            updateField("checkOutRounding", {
                              interval: value as RoundingInterval,
                              direction:
                                formData.checkOutRounding?.direction ||
                                "NEAREST",
                            })
                          }
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROUNDING_INTERVALS.map((interval) => (
                              <SelectItem key={interval} value={interval}>
                                {tEnums(`roundingInterval.${interval}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={
                            formData.checkOutRounding?.direction || "NEAREST"
                          }
                          onValueChange={(value) =>
                            updateField("checkOutRounding", {
                              interval:
                                formData.checkOutRounding?.interval ||
                                "MINUTES_15",
                              direction: value as RoundingDirection,
                            })
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROUNDING_DIRECTIONS.map((direction) => (
                              <SelectItem key={direction} value={direction}>
                                {tEnums(`roundingDirection.${direction}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Break Start Rounding */}
                  <div className="flex items-center gap-4 p-3 border rounded-lg">
                    <Switch
                      checked={formData.enableBreakStartRounding}
                      onCheckedChange={(checked) =>
                        updateField("enableBreakStartRounding", checked)
                      }
                    />
                    <span className="font-medium min-w-[100px]">
                      {t("attendance.breakStartRounding")}
                    </span>
                    {formData.enableBreakStartRounding && (
                      <div className="flex gap-2 flex-1">
                        <Select
                          value={
                            formData.breakStartRounding?.interval ||
                            "MINUTES_15"
                          }
                          onValueChange={(value) =>
                            updateField("breakStartRounding", {
                              interval: value as RoundingInterval,
                              direction:
                                formData.breakStartRounding?.direction ||
                                "NEAREST",
                            })
                          }
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROUNDING_INTERVALS.map((interval) => (
                              <SelectItem key={interval} value={interval}>
                                {tEnums(`roundingInterval.${interval}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={
                            formData.breakStartRounding?.direction || "NEAREST"
                          }
                          onValueChange={(value) =>
                            updateField("breakStartRounding", {
                              interval:
                                formData.breakStartRounding?.interval ||
                                "MINUTES_15",
                              direction: value as RoundingDirection,
                            })
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROUNDING_DIRECTIONS.map((direction) => (
                              <SelectItem key={direction} value={direction}>
                                {tEnums(`roundingDirection.${direction}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Break End Rounding */}
                  <div className="flex items-center gap-4 p-3 border rounded-lg">
                    <Switch
                      checked={formData.enableBreakEndRounding}
                      onCheckedChange={(checked) =>
                        updateField("enableBreakEndRounding", checked)
                      }
                    />
                    <span className="font-medium min-w-[100px]">
                      {t("attendance.breakEndRounding")}
                    </span>
                    {formData.enableBreakEndRounding && (
                      <div className="flex gap-2 flex-1">
                        <Select
                          value={
                            formData.breakEndRounding?.interval || "MINUTES_15"
                          }
                          onValueChange={(value) =>
                            updateField("breakEndRounding", {
                              interval: value as RoundingInterval,
                              direction:
                                formData.breakEndRounding?.direction ||
                                "NEAREST",
                            })
                          }
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROUNDING_INTERVALS.map((interval) => (
                              <SelectItem key={interval} value={interval}>
                                {tEnums(`roundingInterval.${interval}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={
                            formData.breakEndRounding?.direction || "NEAREST"
                          }
                          onValueChange={(value) =>
                            updateField("breakEndRounding", {
                              interval:
                                formData.breakEndRounding?.interval ||
                                "MINUTES_15",
                              direction: value as RoundingDirection,
                            })
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROUNDING_DIRECTIONS.map((direction) => (
                              <SelectItem key={direction} value={direction}>
                                {tEnums(`roundingDirection.${direction}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cấu hình giờ giải lao */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">
          {t("break.sectionTitle")}
        </h2>
        <BreakSection config={breakFormData} onUpdate={updateBreakField} />
      </div>
    </>
  );
}
