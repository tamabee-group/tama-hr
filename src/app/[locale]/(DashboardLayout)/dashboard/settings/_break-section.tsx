"use client";

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
import { BreakConfig } from "@/types/attendance-config";

interface BreakSectionProps {
  config: BreakConfig;
  onUpdate: <K extends keyof BreakConfig>(
    field: K,
    value: BreakConfig[K],
  ) => void;
}

/**
 * Section cấu hình giờ giải lao trong tab Chấm công.
 * Đơn giản: khi chấm giải lao, thời gian đó bị trừ khỏi giờ làm việc, không tính lương.
 */
export function BreakSection({ config, onUpdate }: BreakSectionProps) {
  const t = useTranslations("companySettings");
  const tCommon = useTranslations("common");

  return (
    <GlassSection title={t("break.sectionTitle")}>
      <div className="space-y-6">
        {/* Bật/tắt giờ giải lao */}
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
          <>
            {/* Thời gian mặc định + Số lần tối đa */}
            <div className="grid grid-cols-2 gap-4">
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
                <Label>{t("break.maxBreaksPerDay")}</Label>
                <InputGroup>
                  <InputGroupInput
                    type="number"
                    min={1}
                    max={10}
                    value={config.maxBreaksPerDay}
                    onChange={(e) =>
                      onUpdate("maxBreaksPerDay", parseInt(e.target.value) || 1)
                    }
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>{t("break.times")}</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </div>
            </div>

            {/* Link đến help */}
            <HelpLink topic="company_settings" article="break_settings" />
          </>
        )}
      </div>
    </GlassSection>
  );
}
