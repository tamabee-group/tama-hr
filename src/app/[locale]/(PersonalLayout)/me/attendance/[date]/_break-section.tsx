"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { GlassSection } from "@/app/[locale]/_components/_glass-style";
import { Coffee } from "lucide-react";
import { formatTime } from "@/lib/utils/format-date-time";
import type { BreakRecord } from "@/types/attendance-records";

// ============================================
// Types
// ============================================

interface BreakSectionProps {
  breakRecords: BreakRecord[];
  totalBreakMinutes: number;
}

// ============================================
// Main Component
// ============================================

export function BreakSection({
  breakRecords,
  totalBreakMinutes,
}: BreakSectionProps) {
  const t = useTranslations("break.history");

  // Sắp xếp theo breakNumber tăng dần
  const sortedRecords = [...breakRecords].sort(
    (a, b) => a.breakNumber - b.breakNumber,
  );

  return (
    <GlassSection
      title={t("title")}
      icon={<Coffee className="h-4 w-4" />}
      headerAction={
        <span className="text-sm font-medium text-muted-foreground">
          {totalBreakMinutes} {t("minutes")}
        </span>
      }
    >
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
