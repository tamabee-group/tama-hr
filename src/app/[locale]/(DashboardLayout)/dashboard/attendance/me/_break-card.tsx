"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Clock, Edit2, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/utils/format-date";
import type { BreakRecord } from "@/types/attendance-records";

// ============================================
// Types
// ============================================

interface BreakCardProps {
  breakRecord: BreakRecord;
  isActive: boolean;
  onClick?: () => void;
  /** Compact mode cho mobile - hiển thị thông tin cơ bản, có thể expand */
  compact?: boolean;
}

// ============================================
// BreakCard Component
// ============================================

export function BreakCard({
  breakRecord,
  isActive,
  onClick,
  compact = false,
}: BreakCardProps) {
  const t = useTranslations("break.history");
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Xử lý click - nếu compact mode thì toggle expand, nếu không thì gọi onClick
  const handleClick = () => {
    if (compact) {
      setIsExpanded(!isExpanded);
    } else {
      onClick?.();
    }
  };

  // Xử lý click vào nút edit khi đang ở compact mode
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  return (
    <div
      className={`
        rounded-lg border transition-all
        ${
          isActive
            ? "bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800"
            : "bg-card hover:bg-accent/50 border-border"
        }
        ${onClick || compact ? "cursor-pointer hover:shadow-sm" : ""}
        ${compact ? "min-h-[44px]" : ""}
      `}
      onClick={handleClick}
      role={onClick || compact ? "button" : undefined}
      tabIndex={onClick || compact ? 0 : undefined}
      onKeyDown={(e) => {
        if ((onClick || compact) && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Compact mode - Mobile view */}
      {compact ? (
        <div className="p-3">
          {/* Header row - luôn hiển thị */}
          <div className="flex items-center justify-between min-h-[38px]">
            <div className="flex items-center gap-2">
              {/* Break number badge */}
              <div
                className={`
                  flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium shrink-0
                  ${
                    isActive
                      ? "bg-orange-500 text-white"
                      : "bg-primary/10 text-primary"
                  }
                `}
              >
                {breakRecord.breakNumber}
              </div>

              {/* Time và duration */}
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">
                  {formatTime(breakRecord.breakStart)}
                </span>
                <span className="text-muted-foreground">→</span>
                <span className="font-medium">
                  {isActive ? (
                    <span className="text-orange-600">...</span>
                  ) : (
                    formatTime(breakRecord.breakEnd)
                  )}
                </span>
              </div>

              {isActive && (
                <Badge
                  variant="default"
                  className="bg-orange-500 text-xs px-1.5 py-0 ml-1"
                >
                  {t("inProgress")}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Duration */}
              <span className="text-sm font-semibold">
                {breakRecord.actualBreakMinutes}
                <span className="text-xs text-muted-foreground ml-0.5">
                  {t("minutes")}
                </span>
              </span>

              {/* Expand/collapse icon */}
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Expanded details */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-border space-y-2">
              {/* Chi tiết thời gian */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("startTime")}
                  </p>
                  <p className="font-medium">
                    {formatTime(breakRecord.breakStart)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("endTime")}
                  </p>
                  <p className="font-medium">
                    {isActive
                      ? t("inProgress")
                      : formatTime(breakRecord.breakEnd)}
                  </p>
                </div>
              </div>

              {/* Thời gian thực tế */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {t("duration")}
                </span>
                <span className="text-sm font-semibold">
                  {breakRecord.actualBreakMinutes} {t("minutes")}
                </span>
              </div>

              {/* Nút chỉnh sửa - min 44px touch target */}
              {onClick && !isActive && (
                <button
                  onClick={handleEditClick}
                  className="w-full mt-2 flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors touch-manipulation active:scale-[0.98]"
                >
                  <Edit2 className="h-4 w-4" />
                  {t("requestAdjustment")}
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Desktop view - Original layout */
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Break number badge */}
              <div
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                  ${
                    isActive
                      ? "bg-orange-500 text-white"
                      : "bg-primary/10 text-primary"
                  }
                `}
              >
                {breakRecord.breakNumber}
              </div>

              <div className="space-y-0.5">
                {/* Break number label */}
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">
                    {t("breakNumber", { number: breakRecord.breakNumber })}
                  </p>
                  {isActive && (
                    <Badge
                      variant="default"
                      className="bg-orange-500 text-xs px-1.5 py-0"
                    >
                      {t("inProgress")}
                    </Badge>
                  )}
                </div>

                {/* Time range */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(breakRecord.breakStart)}</span>
                  <span>→</span>
                  <span>
                    {isActive ? (
                      <span className="text-orange-600 font-medium">...</span>
                    ) : (
                      formatTime(breakRecord.breakEnd)
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Duration and edit icon */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold">
                  {breakRecord.actualBreakMinutes} {t("minutes")}
                </p>
                <p className="text-xs text-muted-foreground">{t("duration")}</p>
              </div>

              {/* Edit icon - chỉ hiển thị khi có onClick và không đang active */}
              {onClick && !isActive && (
                <Edit2 className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
