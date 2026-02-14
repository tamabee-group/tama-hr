"use client";

import { useTranslations } from "next-intl";
import { GlassSection } from "@/app/[locale]/_components/_glass-style";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Wallet,
  Timer,
  Settings2,
  Coffee,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CompanySettings } from "@/types/attendance-config";
import {
  checkSettingsCompleteness,
  hasIncompleteSettings,
} from "@/lib/utils/settings-completeness";

interface ConfigurationSummaryCardProps {
  settings: CompanySettings | null;
  className?: string;
}

export function ConfigurationSummaryCard({
  settings,
  className,
}: ConfigurationSummaryCardProps) {
  const t = useTranslations("companySettings");

  const completenessResult = checkSettingsCompleteness(settings);

  return (
    <GlassSection className={className}>
      <div className="flex items-center gap-2 mb-4">
        <Settings2 className="h-4 w-4" />
        <h3 className="text-base font-semibold">{t("summary.title")}</h3>
      </div>
      <div className="space-y-4">
        {/* Completion Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {t("summary.completion")}
            </span>
            <span
              className={cn(
                "font-medium",
                completenessResult.completionPercentage === 100
                  ? "text-green-600"
                  : completenessResult.completionPercentage >= 80
                    ? "text-yellow-600"
                    : "text-red-400",
              )}
            >
              {completenessResult.completionPercentage}%
            </span>
          </div>
          <Progress
            value={completenessResult.completionPercentage}
            className="h-2"
          />
        </div>

        {/* Status Items */}
        <div className="space-y-2">
          <ConfigStatusItem
            label={t("tabs.attendance")}
            icon={Clock}
            isComplete={
              !hasIncompleteSettings("attendance", completenessResult)
            }
          />
          <ConfigStatusItem
            label={t("tabs.break")}
            icon={Coffee}
            isComplete={!hasIncompleteSettings("break", completenessResult)}
          />
          <ConfigStatusItem
            label={t("tabs.payroll")}
            icon={Wallet}
            isComplete={!hasIncompleteSettings("payroll", completenessResult)}
          />
          <ConfigStatusItem
            label={t("tabs.overtime")}
            icon={Timer}
            isComplete={!hasIncompleteSettings("overtime", completenessResult)}
          />
        </div>
      </div>
    </GlassSection>
  );
}

interface ConfigStatusItemProps {
  label: string;
  icon: typeof Clock;
  isComplete: boolean;
}

function ConfigStatusItem({
  label,
  icon: Icon,
  isComplete,
}: ConfigStatusItemProps) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span>{label}</span>
      </div>
      {isComplete ? (
        <CheckCircle2 className="h-4 w-4 text-green-600" />
      ) : (
        <AlertCircle className="h-4 w-4 text-yellow-600" />
      )}
    </div>
  );
}
