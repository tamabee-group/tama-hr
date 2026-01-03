"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Coffee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/utils/format-date";
import type { BreakRecord } from "@/types/attendance-records";

// ============================================
// Types
// ============================================

interface BreakTimelineProps {
  breakRecords: BreakRecord[];
  totalBreakMinutes: number;
  minimumRequired: number;
  maxBreaksPerDay: number;
  isCompliant: boolean;
}

// ============================================
// BreakTimeline Component
// ============================================

export function BreakTimeline({
  breakRecords,
  totalBreakMinutes,
  maxBreaksPerDay,
}: BreakTimelineProps) {
  const t = useTranslations("break.history");

  // Sắp xếp theo breakNumber tăng dần
  const sortedRecords = [...breakRecords].sort(
    (a, b) => a.breakNumber - b.breakNumber,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Coffee className="h-4 w-4" />
            {t("title")}
          </span>
          <Badge variant="outline" className="text-xs">
            {sortedRecords.length}/{maxBreaksPerDay}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        {sortedRecords.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            {t("noRecords")}
          </div>
        ) : (
          <div className="space-y-2">
            {sortedRecords.map((record) => (
              <BreakRecordItem key={record.id} record={record} t={t} />
            ))}
          </div>
        )}

        {/* Tổng thời gian */}
        <div className="flex items-center justify-between text-sm mt-4 pt-3 border-t">
          <span className="text-muted-foreground">{t("totalBreakTime")}</span>
          <span className="font-semibold">
            {totalBreakMinutes} {t("minutes")}
          </span>
        </div>
      </CardContent>
    </Card>
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
  const isActive = !record.breakEnd;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
      <div className="flex items-center gap-3">
        {/* Break number badge */}
        <div className="flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium bg-primary/10 text-primary">
          {record.breakNumber}
        </div>

        {/* Time range */}
        <span className="text-sm">
          {record.breakStart ? formatTime(record.breakStart) : "-"}
          <span className="mx-2 text-muted-foreground">→</span>
          {isActive ? (
            <span className="text-orange-600 font-medium">...</span>
          ) : record.breakEnd ? (
            formatTime(record.breakEnd)
          ) : (
            "-"
          )}
        </span>
      </div>

      {/* Duration */}
      <span className="text-sm font-medium">
        {record.actualBreakMinutes} {t("minutes")}
      </span>
    </div>
  );
}
