"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Coffee, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { BreakRecord } from "@/types/attendance-records";
import { BreakCard } from "./_break-card";

// ============================================
// Types
// ============================================

interface BreakTimelineProps {
  breakRecords: BreakRecord[];
  totalBreakMinutes: number;
  minimumRequired: number;
  maxBreaksPerDay: number;
  isCompliant: boolean;
  onBreakClick?: (breakRecord: BreakRecord) => void;
}

// ============================================
// Utilities
// ============================================

function formatMinutesToDisplay(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}`;
  if (mins === 0) return `${hours * 60}`;
  return `${hours * 60 + mins}`;
}

// ============================================
// Custom hook để detect mobile
// ============================================

function useIsMobile(breakpoint: number = 640): boolean {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    // Kiểm tra ban đầu
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    checkMobile();

    // Lắng nghe resize
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);

  return isMobile;
}

// ============================================
// BreakTimeline Component
// ============================================

export function BreakTimeline({
  breakRecords,
  totalBreakMinutes,
  minimumRequired,
  maxBreaksPerDay,
  isCompliant,
  onBreakClick,
}: BreakTimelineProps) {
  const t = useTranslations("break");
  const isMobile = useIsMobile();

  // Sắp xếp theo breakNumber tăng dần
  const sortedRecords = [...breakRecords].sort(
    (a, b) => a.breakNumber - b.breakNumber,
  );

  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="flex items-center justify-between text-sm sm:text-base">
          <div className="flex items-center gap-2">
            <Coffee className="h-4 w-4" />
            <span className="hidden sm:inline">{t("history.title")}</span>
            <span className="sm:hidden">{t("history.titleShort")}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {sortedRecords.length}/{maxBreaksPerDay}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {/* Timeline của các lần nghỉ */}
        {sortedRecords.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            {t("history.noRecords")}
          </div>
        ) : isMobile ? (
          /* Mobile view - Vertical stack với compact cards */
          <div className="space-y-2">
            {sortedRecords.map((record) => {
              const isActive = !record.breakEnd;

              return (
                <BreakCard
                  key={record.id}
                  breakRecord={record}
                  isActive={isActive}
                  onClick={
                    onBreakClick ? () => onBreakClick(record) : undefined
                  }
                  compact={true}
                />
              );
            })}
          </div>
        ) : (
          /* Desktop view - Timeline với vertical line */
          <div className="relative space-y-3">
            {/* Vertical timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

            {sortedRecords.map((record) => {
              const isActive = !record.breakEnd;

              return (
                <div key={record.id} className="relative pl-10">
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-2.5 top-4 w-3 h-3 rounded-full border-2 ${
                      isActive
                        ? "bg-orange-500 border-orange-500 animate-pulse"
                        : "bg-background border-primary"
                    }`}
                  />

                  <BreakCard
                    breakRecord={record}
                    isActive={isActive}
                    onClick={
                      onBreakClick ? () => onBreakClick(record) : undefined
                    }
                  />
                </div>
              );
            })}
          </div>
        )}

        <Separator />

        {/* Tổng kết - Responsive layout */}
        <div className="space-y-2">
          {/* Mobile: 2 columns grid, Desktop: flex rows */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-1 sm:gap-0 sm:space-y-2">
            {/* Tổng thời gian nghỉ */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm">
              <span className="text-xs sm:text-sm text-muted-foreground">
                {t("history.totalBreakTime")}
              </span>
              <span className="font-semibold text-base sm:text-sm">
                {formatMinutesToDisplay(totalBreakMinutes)}{" "}
                <span className="text-xs sm:text-sm">
                  {t("history.minutes")}
                </span>
              </span>
            </div>

            {/* Yêu cầu tối thiểu */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm">
              <span className="text-xs sm:text-sm text-muted-foreground">
                {t("history.minimumRequired")}
              </span>
              <span className="font-medium text-base sm:text-sm">
                {formatMinutesToDisplay(minimumRequired)}{" "}
                <span className="text-xs sm:text-sm">
                  {t("history.minutes")}
                </span>
              </span>
            </div>
          </div>

          {/* Trạng thái compliance - Full width */}
          <div className="flex items-center justify-between text-sm pt-1 sm:pt-0">
            <span className="text-xs sm:text-sm text-muted-foreground">
              {t("history.complianceTitle")}
            </span>
            <ComplianceBadge isCompliant={isCompliant} t={t} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// ComplianceBadge Component
// ============================================

interface ComplianceBadgeProps {
  isCompliant: boolean;
  t: ReturnType<typeof useTranslations<"break">>;
}

function ComplianceBadge({ isCompliant, t }: ComplianceBadgeProps) {
  if (isCompliant) {
    return (
      <Badge
        variant="outline"
        className="text-green-600 border-green-600 text-xs"
      >
        <CheckCircle2 className="h-3 w-3 mr-1" />
        <span className="hidden sm:inline">
          {t("history.complianceCompliant")}
        </span>
        <span className="sm:hidden">
          {t("history.complianceCompliantShort")}
        </span>
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="text-orange-600 border-orange-600 text-xs"
    >
      <AlertCircle className="h-3 w-3 mr-1" />
      <span className="hidden sm:inline">
        {t("history.complianceNonCompliant")}
      </span>
      <span className="sm:hidden">
        {t("history.complianceNonCompliantShort")}
      </span>
    </Badge>
  );
}
