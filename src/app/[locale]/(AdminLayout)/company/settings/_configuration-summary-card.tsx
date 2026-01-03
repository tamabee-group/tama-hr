"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Wallet,
  Timer,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CompanySettings,
  WorkModeConfig,
  WorkMode,
} from "@/types/attendance-config";
import {
  checkSettingsCompleteness,
  hasIncompleteSettings,
  IncompleteSetting,
} from "@/lib/utils/settings-completeness";

interface ConfigurationSummaryCardProps {
  settings: CompanySettings | null;
  workModeConfig: WorkModeConfig | null;
  className?: string;
}

/**
 * Card hiển thị tóm tắt cấu hình hiện tại
 * - Hiển thị work mode
 * - Hiển thị completion percentage
 * - Highlight các cấu hình còn thiếu
 */
/**
 * Lấy label cho field key
 */
function getFieldLabel(
  setting: IncompleteSetting,
  t: ReturnType<typeof useTranslations>,
): string {
  const { type, fieldKey } = setting;

  // Map field keys to translation keys
  const fieldLabels: Record<string, Record<string, string>> = {
    workMode: {
      mode: "workMode.title",
      defaultWorkStartTime: "workMode.defaultHours",
      defaultWorkEndTime: "workMode.defaultHours",
    },
    attendance: {
      config: "tabs.attendance",
      defaultWorkStartTime: "attendance.defaultWorkStartTime",
      defaultWorkEndTime: "attendance.defaultWorkEndTime",
    },
    payroll: {
      config: "tabs.payroll",
      payDay: "payroll.payDay",
      cutoffDay: "payroll.cutoffDay",
    },
    overtime: {
      config: "tabs.overtime",
    },
    break: {
      config: "break.sectionTitle",
    },
  };

  const labelKey = fieldLabels[type]?.[fieldKey];
  if (labelKey) {
    return t(labelKey);
  }

  // Fallback: return field key
  return fieldKey;
}

export function ConfigurationSummaryCard({
  settings,
  workModeConfig,
  className,
}: ConfigurationSummaryCardProps) {
  const t = useTranslations("companySettings");

  const completenessResult = checkSettingsCompleteness(
    settings,
    workModeConfig,
  );

  // Lọc các fields thiếu (chỉ lấy unique labels)
  const missingFieldLabels = completenessResult.incompleteSettings
    .map((setting) => getFieldLabel(setting, t))
    .filter((label, index, self) => self.indexOf(label) === index);

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          {t("summary.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Work Mode */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {t("workMode.title")}
          </span>
          <Badge
            variant={
              workModeConfig?.mode === WorkMode.FIXED_HOURS
                ? "secondary"
                : "default"
            }
          >
            {workModeConfig?.mode === WorkMode.FIXED_HOURS
              ? t("workMode.fixedHours")
              : t("workMode.flexibleShift")}
          </Badge>
        </div>

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
                    : "text-red-600",
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

        {/* Warning message if incomplete - hiển thị chi tiết các fields thiếu */}
        {!completenessResult.isComplete && (
          <div className="flex flex-col gap-2 p-3 rounded-md bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="text-sm font-medium">
                {t("summary.missingFields")}
              </p>
            </div>
            <ul className="ml-6 text-xs space-y-1 list-disc">
              {missingFieldLabels.map((label, index) => (
                <li key={index}>{label}</li>
              ))}
            </ul>
          </div>
        )}
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
