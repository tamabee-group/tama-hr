"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { AttendanceStatusBadge } from "@/app/[locale]/_components/_shared/_status-badge";
import {
  TimeDisplay,
  DurationDisplay,
} from "@/app/[locale]/_components/_shared/_time-display";

import { AttendanceRecord } from "@/types/attendance-records";
import { formatDate, getDayOfWeek } from "@/lib/utils/format-date";
import type { SupportedLocale } from "@/lib/utils/format-currency";

interface AttendanceTableProps {
  records: AttendanceRecord[];
  employeeId: number;
  locale: SupportedLocale;
}

/**
 * Component bảng attendance với pagination
 * Columns: Date, Shift, Check In, Check Out, Status, Total Hours, Actions
 */
export function AttendanceTable({ records, locale }: AttendanceTableProps) {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const router = useRouter();

  // Handle view detail
  const handleViewDetail = (id: number) => {
    router.push(`/${locale}/dashboard/attendance/${id}`);
  };

  // Define columns
  const columns: ColumnDef<AttendanceRecord>[] = [
    {
      id: "stt",
      header: "#",
      cell: ({ row }) => row.index + 1,
      size: 60,
    },
    {
      accessorKey: "workDate",
      header: t("table.date"),
      cell: ({ row }) => {
        const date = row.original.workDate;
        return (
          <div>
            <div className="font-medium">{formatDate(date, locale)}</div>
            <div className="text-xs text-muted-foreground">
              {getDayOfWeek(date, locale)}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "shiftInfo",
      header: t("shiftInfo.shiftName"),
      cell: ({ row }) => {
        const shift = row.original.shiftInfo;
        if (!shift) return "-";
        return (
          <div>
            <div className="font-medium">{shift.shiftName}</div>
            {shift.startTime && shift.endTime && (
              <div className="text-xs text-muted-foreground">
                {shift.startTime} - {shift.endTime}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "roundedCheckIn",
      header: t("table.checkInTime"),
      cell: ({ row }) => (
        <TimeDisplay
          time={row.original.roundedCheckIn || row.original.originalCheckIn}
        />
      ),
    },
    {
      accessorKey: "roundedCheckOut",
      header: t("table.checkOutTime"),
      cell: ({ row }) => (
        <TimeDisplay
          time={row.original.roundedCheckOut || row.original.originalCheckOut}
        />
      ),
    },
    {
      accessorKey: "status",
      header: t("table.status"),
      cell: ({ row }) => <AttendanceStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "workingMinutes",
      header: t("table.workingHours"),
      cell: ({ row }) => (
        <DurationDisplay minutes={row.original.workingMinutes} />
      ),
    },
    {
      id: "actions",
      header: tCommon("actions"),
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDetail(row.original.id)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
      size: 80,
    },
  ];

  return (
    <div>
      <div className="font-bold mb-2">
        <div>{t("history")}</div>
      </div>
      <div>
        <BaseTable
          columns={columns}
          data={records}
          showPagination={true}
          pageSize={20}
          noResultsText={t("messages.noRecords")}
          previousText={tCommon("previous")}
          nextText={tCommon("next")}
        />
      </div>
    </div>
  );
}
