"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface BreakPeriod {
  name: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isFlexible?: boolean;
}

interface ScheduleTimelineProps {
  workStartTime: string;
  workEndTime: string;
  breakPeriods?: BreakPeriod[];
  isOvernight?: boolean;
  className?: string;
}

/**
 * Chuyển đổi time string "HH:mm" thành số phút từ 00:00
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Tính phần trăm vị trí trên timeline 24h
 */
function minutesToPercent(minutes: number): number {
  return (minutes / (24 * 60)) * 100;
}

/**
 * Format time để hiển thị
 */
function formatTime(time: string): string {
  return time;
}

/**
 * Component hiển thị timeline 24h với working hours và breaks
 * - Hiển thị timeline từ 00:00 đến 24:00
 * - Highlight working hours với màu primary
 * - Hiển thị break periods với màu khác
 * - Hỗ trợ overnight schedules (qua đêm)
 */
export function ScheduleTimeline({
  workStartTime,
  workEndTime,
  breakPeriods = [],
  isOvernight,
  className,
}: ScheduleTimelineProps) {
  const t = useTranslations("schedules");

  // Tính toán các vị trí trên timeline
  const timelineData = useMemo(() => {
    const startMinutes = timeToMinutes(workStartTime);
    const endMinutes = timeToMinutes(workEndTime);

    // Kiểm tra overnight schedule
    const overnight = isOvernight ?? endMinutes < startMinutes;

    // Tính working segments
    const workSegments: { start: number; end: number }[] = [];

    if (overnight) {
      // Overnight: 2 segments (start -> 24:00 và 00:00 -> end)
      workSegments.push({ start: startMinutes, end: 24 * 60 });
      workSegments.push({ start: 0, end: endMinutes });
    } else {
      // Normal: 1 segment
      workSegments.push({ start: startMinutes, end: endMinutes });
    }

    // Tính break segments
    const breakSegments = breakPeriods.map((bp) => ({
      name: bp.name,
      start: timeToMinutes(bp.startTime),
      end: timeToMinutes(bp.endTime),
      isFlexible: bp.isFlexible,
    }));

    return { workSegments, breakSegments, overnight };
  }, [workStartTime, workEndTime, breakPeriods, isOvernight]);

  // Tạo các mốc giờ để hiển thị
  const hourMarkers = [0, 6, 12, 18, 24];

  return (
    <div className={cn("space-y-2", className)}>
      {/* Timeline container */}
      <div className="relative h-12 bg-muted rounded-lg overflow-hidden">
        {/* Working hours segments */}
        {timelineData.workSegments.map((segment, index) => (
          <div
            key={`work-${index}`}
            className="absolute top-0 h-full bg-primary/30"
            style={{
              left: `${minutesToPercent(segment.start)}%`,
              width: `${minutesToPercent(segment.end - segment.start)}%`,
            }}
          />
        ))}

        {/* Break periods */}
        {timelineData.breakSegments.map((segment, index) => (
          <div
            key={`break-${index}`}
            className={cn(
              "absolute top-1 h-10 rounded",
              segment.isFlexible
                ? "bg-yellow-500/50 border border-yellow-500 border-dashed"
                : "bg-orange-500/50",
            )}
            style={{
              left: `${minutesToPercent(segment.start)}%`,
              width: `${minutesToPercent(segment.end - segment.start)}%`,
            }}
            title={segment.name}
          />
        ))}

        {/* Start/End markers */}
        <div
          className="absolute top-0 h-full w-0.5 bg-primary"
          style={{ left: `${minutesToPercent(timeToMinutes(workStartTime))}%` }}
        />
        <div
          className="absolute top-0 h-full w-0.5 bg-primary"
          style={{ left: `${minutesToPercent(timeToMinutes(workEndTime))}%` }}
        />

        {/* Hour markers */}
        {hourMarkers.map((hour) => (
          <div
            key={hour}
            className="absolute top-0 h-full w-px bg-border"
            style={{ left: `${(hour / 24) * 100}%` }}
          />
        ))}
      </div>

      {/* Hour labels */}
      <div className="relative h-4">
        {hourMarkers.map((hour) => (
          <span
            key={hour}
            className="absolute text-xs text-muted-foreground transform -translate-x-1/2"
            style={{ left: `${(hour / 24) * 100}%` }}
          >
            {hour.toString().padStart(2, "0")}:00
          </span>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-primary/30 border border-primary" />
          <span className="text-muted-foreground">
            {formatTime(workStartTime)} - {formatTime(workEndTime)}
            {timelineData.overnight && ` (${t("overnight")})`}
          </span>
        </div>
        {breakPeriods.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-orange-500/50" />
            <span className="text-muted-foreground">{t("breakTime")}</span>
          </div>
        )}
        {breakPeriods.some((bp) => bp.isFlexible) && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-yellow-500/50 border border-yellow-500 border-dashed" />
            <span className="text-muted-foreground">{t("flexibleBreak")}</span>
          </div>
        )}
      </div>
    </div>
  );
}
