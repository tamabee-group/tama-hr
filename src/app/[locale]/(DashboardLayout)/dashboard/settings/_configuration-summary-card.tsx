"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Wallet,
  Timer,
  Settings2,
  Coffee,
  Plus,
  Minus,
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

  const completenessResult = checkSettingsCompleteness(settings, null);

  return (
    <Card className={cn("pt-5 gap-1", className)}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          {t("summary.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
          <ConfigStatusItem
            label={t("tabs.allowance")}
            icon={Plus}
            isComplete={!hasIncompleteSettings("allowance", completenessResult)}
          />
          <ConfigStatusItem
            label={t("tabs.deduction")}
            icon={Minus}
            isComplete={!hasIncompleteSettings("deduction", completenessResult)}
          />
        </div>
      </CardContent>
    </Card>
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
