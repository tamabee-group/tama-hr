"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Coffee, MapPin } from "lucide-react";
import { GlassSection } from "@/app/[locale]/_components/_glass-style";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/utils/format-date-time";
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
  showLocation?: boolean;
}

// ============================================
// BreakTimeline Component
// ============================================

export function BreakTimeline({
  breakRecords,
  totalBreakMinutes,
  maxBreaksPerDay,
  showLocation = false,
}: BreakTimelineProps) {
  const t = useTranslations("break.history");
  const tAttendance = useTranslations("attendance");

  // Sắp xếp theo breakNumber tăng dần
  const sortedRecords = [...breakRecords].sort(
    (a, b) => a.breakNumber - b.breakNumber,
  );

  return (
    <GlassSection
      title={t("title")}
      icon={<Coffee className="h-4 w-4" />}
      headerAction={
        <Badge variant="outline" className="text-xs">
          {sortedRecords.length}/{maxBreaksPerDay}
        </Badge>
      }
    >
      {sortedRecords.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground text-sm">
          {t("noRecords")}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedRecords.map((record) => (
            <BreakRecordItem
              key={record.id}
              record={record}
              t={t}
              showLocation={showLocation}
              locationLabel={tAttendance("viewLocation")}
            />
          ))}
        </div>
      )}

      {/* Tổng thời gian */}
      <div className="flex items-center justify-between text-sm mt-4 pt-3 border-t border-gray-200/50 dark:border-white/10">
        <span className="text-muted-foreground">{t("totalBreakTime")}</span>
        <span className="font-semibold">
          {totalBreakMinutes} {t("minutes")}
        </span>
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
  showLocation?: boolean;
  locationLabel?: string;
}

function BreakRecordItem({
  record,
  t,
  showLocation,
  locationLabel,
}: BreakRecordItemProps) {
  const isActive = !record.breakEnd;

  // Mở Google Maps tại vị trí
  const openMap = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const hasStartLocation =
    record.breakStartLatitude != null && record.breakStartLongitude != null;
  const hasEndLocation =
    record.breakEndLatitude != null && record.breakEndLongitude != null;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
      <div className="flex items-center gap-3">
        {/* Break number badge */}
        <div className="flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium bg-primary/10 text-primary">
          {record.breakNumber}
        </div>

        {/* Thời gian và vị trí */}
        <div className="flex flex-col gap-0.5">
          <span className="text-sm">
            {record.breakStart ? formatTime(record.breakStart) : "-"}
            {showLocation && hasStartLocation && (
              <button
                onClick={() =>
                  openMap(
                    record.breakStartLatitude!,
                    record.breakStartLongitude!,
                  )
                }
                className="inline-flex items-center gap-0.5 ml-1.5 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <MapPin className="h-3 w-3" />
                {locationLabel}
              </button>
            )}
            <span className="mx-2 text-muted-foreground">→</span>
            {isActive ? (
              <span className="text-orange-600 font-medium">...</span>
            ) : record.breakEnd ? (
              <>
                {formatTime(record.breakEnd)}
                {showLocation && hasEndLocation && (
                  <button
                    onClick={() =>
                      openMap(
                        record.breakEndLatitude!,
                        record.breakEndLongitude!,
                      )
                    }
                    className="inline-flex items-center gap-0.5 ml-1.5 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <MapPin className="h-3 w-3" />
                    {locationLabel}
                  </button>
                )}
              </>
            ) : (
              "-"
            )}
          </span>
        </div>
      </div>

      {/* Duration */}
      <span className="text-sm font-medium">
        {record.actualBreakMinutes} {t("minutes")}
      </span>
    </div>
  );
}
