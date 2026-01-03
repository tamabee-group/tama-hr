"use client";

import { Clock, CalendarClock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWorkMode } from "@/hooks/use-work-mode";
import { cn } from "@/lib/utils";

interface WorkModeIndicatorProps {
  /** Hiển thị dạng compact (chỉ icon) hay full (icon + text) */
  compact?: boolean;
  className?: string;
}

/**
 * Component hiển thị work mode indicator
 * Hiển thị badge với icon và text cho work mode hiện tại
 */
export function WorkModeIndicator({
  compact = false,
  className,
}: WorkModeIndicatorProps) {
  const t = useTranslations("sidebar.workModeIndicator");
  const { workMode, loading, isFixedHours } = useWorkMode();

  if (loading || !workMode) {
    return null;
  }

  const icon = isFixedHours ? (
    <Clock className="h-3.5 w-3.5" />
  ) : (
    <CalendarClock className="h-3.5 w-3.5" />
  );

  const label = isFixedHours ? t("fixedHours") : t("flexibleShift");

  const badge = (
    <Badge
      variant={isFixedHours ? "secondary" : "default"}
      className={cn(
        "gap-1 text-xs font-normal",
        isFixedHours
          ? "bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
          : "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400",
        className,
      )}
    >
      {icon}
      {!compact && <span>{label}</span>}
    </Badge>
  );

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{badge}</TooltipTrigger>
          <TooltipContent side="right">
            <p>
              {label} - {t("tooltip")}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
}
