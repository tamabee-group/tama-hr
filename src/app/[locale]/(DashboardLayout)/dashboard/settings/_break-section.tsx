"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { BreakConfig } from "@/types/attendance-config";
import { BreakType, BREAK_TYPES } from "@/types/attendance-enums";

interface BreakSectionProps {
  config: BreakConfig;
  onUpdate: <K extends keyof BreakConfig>(
    field: K,
    value: BreakConfig[K],
  ) => void;
}

// Thời gian nghỉ tối thiểu theo luật (phút)
const LEGAL_BREAK_MINIMUMS = {
  ja: { standard: 45, extended: 60, nightShift: 60 },
  vi: { standard: 30, extended: 45, nightShift: 45 },
};

/**
 * Section cấu hình giờ giải lao trong tab Chấm công
 */
export function BreakSection({ config, onUpdate }: BreakSectionProps) {
  const t = useTranslations("companySettings");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");

  const getLegalMinimum = (type: keyof typeof LEGAL_BREAK_MINIMUMS.ja) => {
    const localeKey =
      config.locale === "ja" || config.locale === "vi" ? config.locale : "ja";
    return LEGAL_BREAK_MINIMUMS[localeKey][type];
  };

  return (
    <div className="space-y-6">
      {/* Cấu hình chung */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("break.general")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Row 1: Bật giờ giải lao + Loại */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-3">
              <Switch
                id="breakEnabled"
                checked={config.breakEnabled}
                onCheckedChange={(checked) => onUpdate("breakEnabled", checked)}
              />
              <Label htmlFor="breakEnabled" className="cursor-pointer">
                {t("break.breakEnabled")}
              </Label>
            </div>

            {config.breakEnabled && (
              <RadioGroup
                value={config.breakType}
                onValueChange={(value) =>
                  onUpdate("breakType", value as BreakType)
                }
                className="flex gap-4"
              >
                {BREAK_TYPES.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <RadioGroupItem value={type} id={`breakType-${type}`} />
                    <Label
                      htmlFor={`breakType-${type}`}
                      className="cursor-pointer"
                    >
                      {tEnums(`breakType.${type}`)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>

          {/* Row 2: Theo dõi giờ giải lao */}
          {config.breakEnabled && (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Switch
                  id="breakTrackingEnabled"
                  checked={config.breakTrackingEnabled}
                  onCheckedChange={(checked) =>
                    onUpdate("breakTrackingEnabled", checked)
                  }
                />
                <Label
                  htmlFor="breakTrackingEnabled"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {t("break.breakTrackingEnabled")}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="whitespace-pre-line">
                          {t("break.breakTrackingTooltip")}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
              </div>
              {/* Giải thích khi TẮT theo dõi */}
              {!config.breakTrackingEnabled && (
                <p className="text-sm text-muted-foreground ml-11">
                  {t("break.autoDeductInfo", {
                    minutes: config.defaultBreakMinutes,
                  })}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {config.breakEnabled && (
        <>
          {/* Cấu hình thời gian */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("break.durationSettings")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Row 1: Sử dụng theo luật + Khu vực */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                <div className="flex items-center gap-3">
                  <Switch
                    id="useLegalMinimum"
                    checked={config.useLegalMinimum}
                    onCheckedChange={(checked) =>
                      onUpdate("useLegalMinimum", checked)
                    }
                  />
                  <Label
                    htmlFor="useLegalMinimum"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {t("break.useLegalMinimum")}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            {t("break.useLegalMinimumTooltip")}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                </div>

                {config.useLegalMinimum && (
                  <Select
                    value={config.locale}
                    onValueChange={(value) => onUpdate("locale", value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ja">{tEnums("locale.ja")}</SelectItem>
                      <SelectItem value="vi">{tEnums("locale.vi")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Info box khi bật legal minimum */}
              {config.useLegalMinimum && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">
                    {t("break.legalMinimumInfo", {
                      standard: getLegalMinimum("standard"),
                      extended: getLegalMinimum("extended"),
                    })}
                  </p>
                </div>
              )}

              {/* Row 2: Thời gian nghỉ (4 cột) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>{t("break.defaultBreak")}</Label>
                  <InputGroup>
                    <InputGroupInput
                      type="number"
                      min={0}
                      max={480}
                      value={config.defaultBreakMinutes}
                      onChange={(e) =>
                        onUpdate(
                          "defaultBreakMinutes",
                          parseInt(e.target.value) || 0,
                        )
                      }
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>{tCommon("minutes")}</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
                <div className="space-y-2">
                  <Label>{t("break.minimumBreak")}</Label>
                  <InputGroup>
                    <InputGroupInput
                      type="number"
                      min={0}
                      max={480}
                      value={config.minimumBreakMinutes}
                      onChange={(e) =>
                        onUpdate(
                          "minimumBreakMinutes",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      disabled={config.useLegalMinimum}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>{tCommon("minutes")}</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
                <div className="space-y-2">
                  <Label>{t("break.maximumBreak")}</Label>
                  <InputGroup>
                    <InputGroupInput
                      type="number"
                      min={0}
                      max={480}
                      value={config.maximumBreakMinutes}
                      onChange={(e) =>
                        onUpdate(
                          "maximumBreakMinutes",
                          parseInt(e.target.value) || 0,
                        )
                      }
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>{tCommon("minutes")}</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
                <div className="space-y-2">
                  <Label>{t("break.maxBreaksPerDay")}</Label>
                  <InputGroup>
                    <InputGroupInput
                      type="number"
                      min={1}
                      max={10}
                      value={config.maxBreaksPerDay}
                      onChange={(e) =>
                        onUpdate(
                          "maxBreaksPerDay",
                          parseInt(e.target.value) || 1,
                        )
                      }
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>{t("break.times")}</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
