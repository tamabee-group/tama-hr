"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Coffee, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { GlassSection } from "@/app/[locale]/_components/_glass-style";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatTime } from "@/lib/utils/format-date-time";
import type { BreakRecord } from "@/types/attendance-records";

// ============================================
// Types
// ============================================

interface BreakHistoryProps {
  breakRecords: BreakRecord[];
  totalBreakMinutes: number;
  minimumRequired: number;
  isCompliant: boolean;
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
// BreakHistory Component
// ============================================

export function BreakHistory({
  breakRecords,
  totalBreakMinutes,
  minimumRequired,
  isCompliant,
}: BreakHistoryProps) {
  const t = useTranslations("break.history");

  // Sắp xếp theo breakNumber tăng dần
  const sortedRecords = [...breakRecords].sort(
    (a, b) => a.breakNumber - b.breakNumber,
  );

  return (
    <GlassSection title={t("title")} icon={<Coffee className="h-4 w-4" />}>
      <div className="space-y-4">
        {/* Danh sách các lần nghỉ */}
        {sortedRecords.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            {t("noRecords")}
          </div>
        ) : (
          <div className="space-y-3">
            {sortedRecords.map((record) => (
              <BreakRecordItem key={record.id} record={record} t={t} />
            ))}
          </div>
        )}

        <Separator />

        {/* Tổng kết */}
        <div className="space-y-2">
          {/* Tổng thời gian nghỉ */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("totalBreakTime")}</span>
            <span className="font-semibold">
              {formatMinutesToDisplay(totalBreakMinutes)} {t("minutes")}
            </span>
          </div>

          {/* Yêu cầu tối thiểu */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {t("minimumRequired")}
            </span>
            <span className="font-medium">
              {formatMinutesToDisplay(minimumRequired)} {t("minutes")}
            </span>
          </div>

          {/* Trạng thái compliance */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {t("compliance.title")}
            </span>
            <ComplianceBadge isCompliant={isCompliant} t={t} />
          </div>
        </div>
      </div>
    </GlassSection>
  );
}

// ============================================
// BreakRecordItem Component
// ============================================

interface BreakRecordItemProps {
  record: BreakRecord;
  t: ReturnType<typeof useTranslations<"break.history">>;
}

function BreakRecordItem({ record, t }: BreakRecordItemProps) {
  const isInProgress = !record.breakEnd;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
          {record.breakNumber}
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-medium">
            {t("breakNumber", { number: record.breakNumber })}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {record.breakStart ? formatTime(record.breakStart) : "-"}
            </span>
            <span>→</span>
            <span>
              {isInProgress ? (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  {t("inProgress")}
                </Badge>
              ) : record.breakEnd ? (
                formatTime(record.breakEnd)
              ) : (
                "-"
              )}
            </span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold">
          {record.actualBreakMinutes} {t("minutes")}
        </p>
        <p className="text-xs text-muted-foreground">{t("duration")}</p>
      </div>
    </div>
  );
}

// ============================================
// ComplianceBadge Component
// ============================================

interface ComplianceBadgeProps {
  isCompliant: boolean;
  t: ReturnType<typeof useTranslations<"break.history">>;
}

function ComplianceBadge({ isCompliant, t }: ComplianceBadgeProps) {
  if (isCompliant) {
    return (
      <Badge variant="outline" className="text-green-600 border-green-600">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        {t("compliance.compliant")}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-orange-600 border-orange-600">
      <AlertCircle className="h-3 w-3 mr-1" />
      {t("compliance.nonCompliant")}
    </Badge>
  );
}
