"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangle,
  ArrowUpDown,
  Coffee,
  LogIn,
  LogOut,
  MapPin,
} from "lucide-react";

import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { AttendanceStatusBadge } from "@/app/[locale]/_components/_shared/display/_status-badge";
import {
  TimeDisplay,
  DurationDisplay,
} from "@/app/[locale]/_components/_shared/display/_time-display";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

import {
  formatDate,
  formatDateWithDayOfWeek,
} from "@/lib/utils/format-date-time";
import type { UnifiedAttendanceRecord } from "@/types/attendance-records";
import type { SupportedLocale } from "@/lib/utils/format-currency";

// ============================================
// Types
// ============================================

export interface AttendanceRecordsTableProps {
  records: UnifiedAttendanceRecord[];
  loading?: boolean;
  showEmployeeName?: boolean;
  /** Bật chế độ compact: gộp tên+ngày, gộp vào/ra thành 2 dòng */
  compact?: boolean;
  enableSorting?: boolean;
  showLocation?: boolean;
  onRowClick?: (record: UnifiedAttendanceRecord) => void;
  serverPagination?: {
    page: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
    onPageChange: (page: number) => void;
  };
}

// ============================================
// Location Link
// ============================================

function LocationLink({
  lat,
  lng,
  label,
}: {
  lat: number | null | undefined;
  lng: number | null | undefined;
  label: string;
}) {
  if (lat == null || lng == null) return null;
  return (
    <button
      type="button"
      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
      onClick={(e) => {
        e.stopPropagation();
        window.open(
          `https://www.google.com/maps?q=${lat},${lng}`,
          "_blank",
          "noopener,noreferrer",
        );
      }}
    >
      <MapPin className="h-3 w-3" />
      {label}
    </button>
  );
}

// ============================================
// Component
// ============================================

export function AttendanceRecordsTable({
  records,
  loading = false,
  showEmployeeName = false,
  compact = false,
  enableSorting = false,
  showLocation = false,
  onRowClick,
  serverPagination,
}: AttendanceRecordsTableProps) {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const locale = useLocale() as SupportedLocale;

  const columns = React.useMemo(() => {
    const cols: ColumnDef<UnifiedAttendanceRecord>[] = [];

    // STT
    cols.push({
      id: "stt",
      header: "#",
      cell: ({ row }) => {
        const offset = serverPagination
          ? serverPagination.page * serverPagination.pageSize
          : 0;
        return offset + row.index + 1;
      },
      size: 60,
    });

    if (compact && showEmployeeName) {
      // Compact: gộp tên nhân viên + ngày vào 1 cột
      cols.push({
        accessorKey: "employeeName",
        header: enableSorting
          ? ({ column }) => (
              <Button
                variant="ghost"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
                className="-ml-4"
              >
                {t("table.employee")}
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            )
          : t("table.employee"),
        cell: ({ row }) => (
          <div>
            <span className="font-medium">{row.original.employeeName}</span>
            <p className="text-xs text-muted-foreground">
              {formatDate(row.original.workDate, locale)}
            </p>
          </div>
        ),
      });

      // Compact: gộp vào/ra thành 2 dòng trong 1 cột
      cols.push({
        id: "checkInOut",
        header: t("compactInOut"),
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="space-y-0.5">
              {/* Dòng vào */}
              <div className="flex items-center gap-1.5">
                <LogIn className="h-3.5 w-3.5 text-green-600 shrink-0" />
                <TimeDisplay time={r.roundedCheckIn || r.originalCheckIn} />
                {showLocation && (
                  <LocationLink
                    lat={r.checkInLatitude}
                    lng={r.checkInLongitude}
                    label={t("viewLocation")}
                  />
                )}
              </div>
              {/* Dòng ra */}
              <div className="flex items-center gap-1.5">
                <LogOut className="h-3.5 w-3.5 text-red-600 shrink-0" />
                <TimeDisplay time={r.roundedCheckOut || r.originalCheckOut} />
                {showLocation && (
                  <LocationLink
                    lat={r.checkOutLatitude}
                    lng={r.checkOutLongitude}
                    label={t("viewLocation")}
                  />
                )}
              </div>
            </div>
          );
        },
      });
    } else {
      // Chế độ bình thường: các cột riêng biệt
      if (showEmployeeName) {
        cols.push({
          accessorKey: "employeeName",
          header: enableSorting
            ? ({ column }) => (
                <Button
                  variant="ghost"
                  onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                  }
                  className="-ml-4"
                >
                  {t("table.employee")}
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              )
            : t("table.employee"),
          cell: ({ row }) => (
            <span className="font-medium">{row.original.employeeName}</span>
          ),
        });
      }

      // Cột ngày
      cols.push({
        accessorKey: "workDate",
        header: enableSorting
          ? ({ column }) => (
              <Button
                variant="ghost"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
                className="-ml-4"
              >
                {t("table.date")}
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            )
          : t("table.date"),
        cell: ({ row }) =>
          formatDateWithDayOfWeek(row.original.workDate, locale),
      });

      // Cột vào
      cols.push({
        accessorKey: "roundedCheckIn",
        header: t("checkIn"),
        cell: ({ row }) => (
          <div>
            <TimeDisplay
              time={row.original.roundedCheckIn || row.original.originalCheckIn}
            />
            {showLocation && (
              <LocationLink
                lat={row.original.checkInLatitude}
                lng={row.original.checkInLongitude}
                label={t("viewLocation")}
              />
            )}
          </div>
        ),
      });

      // Cột ra
      cols.push({
        accessorKey: "roundedCheckOut",
        header: t("checkOut"),
        cell: ({ row }) => (
          <div>
            <TimeDisplay
              time={
                row.original.roundedCheckOut || row.original.originalCheckOut
              }
            />
            {showLocation && (
              <LocationLink
                lat={row.original.checkOutLatitude}
                lng={row.original.checkOutLongitude}
                label={t("viewLocation")}
              />
            )}
          </div>
        ),
      });
    }

    // Giờ làm
    cols.push({
      accessorKey: "workingMinutes",
      header: enableSorting
        ? ({ column }) => (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="-ml-4"
            >
              {t("workingHours")}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        : t("workingHours"),
      cell: ({ row }) => (
        <DurationDisplay minutes={row.original.workingMinutes} />
      ),
    });

    // Tăng ca
    cols.push({
      accessorKey: "overtimeMinutes",
      header: t("overtime"),
      cell: ({ row }) => {
        const overtime = row.original.overtimeMinutes;
        if (!overtime || overtime === 0) return "-";
        return <DurationDisplay minutes={overtime} className="text-blue-600" />;
      },
    });

    // Nghỉ giải lao
    if (compact) {
      // Compact: hiển thị giờ bắt đầu/kết thúc nghỉ 2 dòng
      cols.push({
        id: "breakInOut",
        header: t("table.break"),
        cell: ({ row }) => {
          const r = row.original;
          const breakMinutes = r.totalBreakMinutes;
          if (!breakMinutes || breakMinutes === 0) return "-";
          const firstBreak = r.breakRecords?.[0];
          if (!firstBreak?.breakStart) {
            return <DurationDisplay minutes={breakMinutes} />;
          }
          return (
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Coffee className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                <TimeDisplay time={firstBreak.breakStart} />
              </div>
              <div className="flex items-center gap-1.5">
                <Coffee className="h-3.5 w-3.5 text-green-600 shrink-0" />
                <TimeDisplay time={firstBreak.breakEnd} />
              </div>
            </div>
          );
        },
      });
    } else {
      cols.push({
        accessorKey: "totalBreakMinutes",
        header: t("breakTime"),
        cell: ({ row }) => {
          const breakMinutes = row.original.totalBreakMinutes;
          const isCompliant = row.original.breakCompliant;
          if (!breakMinutes || breakMinutes === 0) return "-";
          return (
            <div className="flex items-center gap-1">
              <DurationDisplay minutes={breakMinutes} />
              {!isCompliant && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("breakNonCompliant")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          );
        },
      });
    }

    // Trạng thái
    cols.push({
      accessorKey: "status",
      header: tCommon("status"),
      cell: ({ row }) => <AttendanceStatusBadge status={row.original.status} />,
    });

    return cols;
  }, [
    t,
    tCommon,
    locale,
    showEmployeeName,
    compact,
    enableSorting,
    showLocation,
    serverPagination,
  ]);

  if (loading) return <TableSkeleton />;

  if (records.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        {t("messages.noRecords")}
      </div>
    );
  }

  return (
    <BaseTable
      columns={columns}
      data={records}
      showPagination={!!serverPagination}
      pageSize={serverPagination?.pageSize || 20}
      serverPagination={
        serverPagination
          ? {
              page: serverPagination.page,
              totalPages: serverPagination.totalPages,
              totalElements: serverPagination.totalElements,
              onPageChange: serverPagination.onPageChange,
            }
          : undefined
      }
      noResultsText={t("messages.noRecords")}
      previousText={tCommon("previous")}
      nextText={tCommon("next")}
      onRowClick={onRowClick}
    />
  );
}

// ============================================
// Skeleton
// ============================================

function TableSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="ml-auto h-5 w-16" />
        </div>
      ))}
    </div>
  );
}
