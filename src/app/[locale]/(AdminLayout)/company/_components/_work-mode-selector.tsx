"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Clock, CalendarClock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { WorkMode } from "@/types/attendance-config";

interface WorkModeSelectorProps {
  currentMode: WorkMode;
  onModeChange: (mode: WorkMode) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

interface WorkModeOption {
  mode: WorkMode;
  icon: typeof Clock;
  titleKey: string;
  descKey: string;
}

const WORK_MODE_OPTIONS: WorkModeOption[] = [
  {
    mode: "FIXED_HOURS",
    icon: Clock,
    titleKey: "fixedHours",
    descKey: "fixedHoursDesc",
  },
  {
    mode: "FLEXIBLE_SHIFT",
    icon: CalendarClock,
    titleKey: "flexibleShift",
    descKey: "flexibleShiftDesc",
  },
];

/**
 * Component chọn chế độ làm việc của công ty
 * - Hiển thị 2 card lớn với icon và mô tả
 * - Confirmation dialog khi thay đổi mode
 */
export function WorkModeSelector({
  currentMode,
  onModeChange,
  disabled = false,
  className,
}: WorkModeSelectorProps) {
  const t = useTranslations("companySettings.workMode");
  const tCommon = useTranslations("common");

  const [pendingMode, setPendingMode] = useState<WorkMode | null>(null);
  const [isChanging, setIsChanging] = useState(false);

  const handleModeClick = (mode: WorkMode) => {
    if (disabled || mode === currentMode) return;
    setPendingMode(mode);
  };

  const handleConfirmChange = async () => {
    if (!pendingMode) return;

    setIsChanging(true);
    try {
      await onModeChange(pendingMode);
    } finally {
      setIsChanging(false);
      setPendingMode(null);
    }
  };

  const handleCancelChange = () => {
    setPendingMode(null);
  };

  // Kiểm tra xem có đang chuyển từ FLEXIBLE_SHIFT sang FIXED_HOURS không
  const isDowngrading =
    currentMode === "FLEXIBLE_SHIFT" && pendingMode === "FIXED_HOURS";

  return (
    <div className={cn("space-y-4", className)}>
      {/* Mode cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {WORK_MODE_OPTIONS.map((option) => {
          const isSelected = currentMode === option.mode;
          const Icon = option.icon;

          return (
            <Card
              key={option.mode}
              className={cn(
                "relative overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md",
                isSelected && "border-3 border-primary",
                disabled && "opacity-50 cursor-not-allowed",
              )}
              onClick={() => handleModeClick(option.mode)}
            >
              <CardContent className="pb-2">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-6 w-6" />
                      <h3 className="font-semibold">{t(option.titleKey)}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t(option.descKey)}
                    </p>
                  </div>
                </div>
              </CardContent>
              {isSelected && (
                <CardFooter className="absolute right-0 bottom-0 bg-primary text-primary-foreground rounded-tl-md flex-col gap-2 px-4">
                  {t("currentMode")}
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>

      {/* Confirmation dialog */}
      <AlertDialog
        open={pendingMode !== null}
        onOpenChange={(open) => !open && handleCancelChange()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {isDowngrading && (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              {t("confirmChange")}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span>{t("confirmChangeDesc")}</span>
              {isDowngrading && (
                <span className="block text-yellow-600 dark:text-yellow-500 font-medium">
                  {t("schedulesWillBeInactive")}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isChanging}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmChange}
              disabled={isChanging}
            >
              {isChanging ? tCommon("saving") : tCommon("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
