"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatTime } from "@/lib/utils/format-date";
import type { BreakRecord } from "@/types/attendance-records";

// ============================================
// Types
// ============================================

interface BreakReportExpandableProps {
  employeeName: string;
  breakRecords: BreakRecord[];
  totalBreakMinutes: number;
  isCompliant: boolean;
  expanded: boolean;
  onToggle: () => void;
  rowIndex: number;
}

// ============================================
// Utilities
// ============================================

/**
 * Format phút thành chuỗi hiển thị (VD: 1h 30m)
 */
function formatMinutesToDisplay(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// ============================================
// BreakReportExpandable Component
// ============================================

export function BreakReportExpandable({
  employeeName,
  breakRecords,
  totalBreakMinutes,
  isCompliant,
  expanded,
  onToggle,
  rowIndex,
}: BreakReportExpandableProps) {
  const t = useTranslations("reports.break");
  const tBreak = useTranslations("break.history");

  // Sắp xếp theo breakNumber tăng dần
  const sortedRecords = [...breakRecords].sort(
    (a, b) => a.breakNumber - b.breakNumber,
  );

  return (
    <>
      {/* Main Row */}
      <TableRow
        className={`
          ${!isCompliant ? "bg-red-50 dark:bg-red-950/20" : ""}
          ${expanded ? "border-b-0" : ""}
        `}
      >
        <TableCell>{rowIndex + 1}</TableCell>
        <TableCell className="font-medium">{employeeName}</TableCell>
        <TableCell>{formatMinutesToDisplay(totalBreakMinutes)}</TableCell>
        <TableCell>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 px-2 gap-1"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span>{sortedRecords.length}</span>
          </Button>
        </TableCell>
        <TableCell>
          <Badge variant={isCompliant ? "default" : "destructive"}>
            {isCompliant ? t("compliant") : t("nonCompliant")}
          </Badge>
        </TableCell>
      </TableRow>

      {/* Expanded Timeline Row */}
      {expanded && (
        <TableRow
          className={
            !isCompliant ? "bg-red-50/50 dark:bg-red-950/10" : "bg-muted/30"
          }
        >
          <TableCell colSpan={5} className="p-0">
            <div className="px-6 py-4">
              <BreakTimelineCompact
                breakRecords={sortedRecords}
                tBreak={tBreak}
              />
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// ============================================
// BreakTimelineCompact Component
// ============================================

interface BreakTimelineCompactProps {
  breakRecords: BreakRecord[];
  tBreak: ReturnType<typeof useTranslations<"break.history">>;
}

function BreakTimelineCompact({
  breakRecords,
  tBreak,
}: BreakTimelineCompactProps) {
  if (breakRecords.length === 0) {
    return (
      <div className="text-center py-2 text-muted-foreground text-sm">
        {tBreak("noRecords")}
      </div>
    );
  }

  return (
    <div className="relative space-y-2">
      {/* Vertical timeline line */}
      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />

      {breakRecords.map((record) => {
        const isActive = !record.breakEnd;

        return (
          <div key={record.id} className="relative pl-8">
            {/* Timeline dot */}
            <div
              className={`absolute left-1.5 top-3 w-3 h-3 rounded-full border-2 ${
                isActive
                  ? "bg-orange-500 border-orange-500 animate-pulse"
                  : "bg-background border-primary"
              }`}
            />

            {/* Break card compact */}
            <div
              className={`
                p-2 rounded-md border text-sm
                ${
                  isActive
                    ? "bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800"
                    : "bg-card border-border"
                }
              `}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* Break number badge */}
                  <div
                    className={`
                      flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium
                      ${
                        isActive
                          ? "bg-orange-500 text-white"
                          : "bg-primary/10 text-primary"
                      }
                    `}
                  >
                    {record.breakNumber}
                  </div>

                  {/* Time range */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {record.breakStart ? formatTime(record.breakStart) : "-"}
                    </span>
                    <span>→</span>
                    <span>
                      {isActive ? (
                        <span className="text-orange-600 font-medium">...</span>
                      ) : record.breakEnd ? (
                        formatTime(record.breakEnd)
                      ) : (
                        "-"
                      )}
                    </span>
                  </div>

                  {isActive && (
                    <Badge
                      variant="default"
                      className="bg-orange-500 text-xs px-1.5 py-0"
                    >
                      {tBreak("inProgress")}
                    </Badge>
                  )}
                </div>

                {/* Duration */}
                <div className="text-xs font-medium">
                  {record.actualBreakMinutes} {tBreak("minutes")}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
