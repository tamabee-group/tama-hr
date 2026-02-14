"use client";

import { formatTime } from "@/lib/utils/format-date-time";
import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================

export type AttendanceStep =
  | "check_in"
  | "break_start"
  | "break_end"
  | "check_out";

export interface TimelineEvent {
  type: AttendanceStep;
  time: string;
  label: string;
}

interface AttendanceTimelineProps {
  events: TimelineEvent[];
  emptyMessage: string;
}

// ============================================
// Styles
// ============================================

const eventColors: Record<AttendanceStep, string> = {
  check_in: "bg-green-500",
  break_start: "bg-yellow-500",
  break_end: "bg-blue-500",
  check_out: "bg-red-500",
};

// ============================================
// Component
// ============================================

export function AttendanceTimeline({
  events,
  emptyMessage,
}: AttendanceTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={index} className="flex items-center gap-3">
          <div
            className={cn("h-3 w-3 rounded-full", eventColors[event.type])}
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {event.label}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatTime(event.time)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
