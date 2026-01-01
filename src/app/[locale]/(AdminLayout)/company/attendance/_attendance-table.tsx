"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { AttendanceStatusBadge } from "@/app/[locale]/_components/_shared/_status-badge";
import {
  TimeDisplay,
  DurationDisplay,
} from "@/app/[locale]/_components/_shared/_time-display";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AttendanceFilters } from "@/app/[locale]/(AdminLayout)/company/attendance/_attendance-filters";

import {
  attendanceApi,
  AttendanceFilters as AttendanceFilterParams,
} from "@/lib/apis/attendance-api";
import { AttendanceRecord } from "@/types/attendance-records";
import { formatDate } from "@/lib/utils/format-date";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import type { SupportedLocale } from "@/lib/utils/format-currency";

const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 20;

/**
 * Component bảng chấm công của tất cả nhân viên
 * Hiển thị danh sách attendance records với filters
 */
export function AttendanceTable() {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const tBreak = useTranslations("break");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();

  // State
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [filters, setFilters] = useState<AttendanceFilterParams>({});

  // Fetch attendance records
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const response = await attendanceApi.getAttendanceRecords(
        page,
        DEFAULT_LIMIT,
        filters,
      );
      setRecords(response.content);
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoading(false);
    }
  }, [page, filters, tErrors]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Handle filter change
  const handleFilterChange = (newFilters: AttendanceFilterParams) => {
    setFilters(newFilters);
    setPage(DEFAULT_PAGE);
  };

  // Handle view detail
  const handleViewDetail = (id: number) => {
    router.push(`/${locale}/company/attendance/${id}`);
  };

  // Define columns
  const columns: ColumnDef<AttendanceRecord>[] = [
    {
      id: "stt",
      header: "#",
      cell: ({ row }) => page * DEFAULT_LIMIT + row.index + 1,
      size: 60,
    },
    {
      accessorKey: "employeeName",
      header: t("table.employee"),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.employeeName}</span>
      ),
    },
    {
      accessorKey: "workDate",
      header: t("table.date"),
      cell: ({ row }) => formatDate(row.original.workDate, locale),
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
      accessorKey: "workingMinutes",
      header: t("table.workingHours"),
      cell: ({ row }) => (
        <DurationDisplay minutes={row.original.workingMinutes} />
      ),
    },
    {
      accessorKey: "overtimeMinutes",
      header: t("table.overtime"),
      cell: ({ row }) => {
        const overtime = row.original.overtimeMinutes;
        if (!overtime || overtime === 0) return "-";
        return <DurationDisplay minutes={overtime} className="text-blue-600" />;
      },
    },
    {
      accessorKey: "nightMinutes",
      header: t("table.nightHours"),
      cell: ({ row }) => {
        const nightMinutes = row.original.nightMinutes;
        if (!nightMinutes || nightMinutes === 0) return "-";
        return (
          <DurationDisplay minutes={nightMinutes} className="text-purple-600" />
        );
      },
    },
    {
      accessorKey: "totalBreakMinutes",
      header: t("table.breakDuration"),
      cell: ({ row }) => {
        const breakMinutes = row.original.totalBreakMinutes;
        const isCompliant = row.original.isBreakCompliant;

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
                    <p>{tBreak("history.complianceNonCompliant")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "lateMinutes",
      header: t("table.lateMinutes"),
      cell: ({ row }) => {
        const late = row.original.lateMinutes;
        if (!late || late === 0) return "-";
        return (
          <span className="text-red-600">
            {late} {tCommon("minutes")}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: t("table.status"),
      cell: ({ row }) => <AttendanceStatusBadge status={row.original.status} />,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-muted-foreground">{tCommon("loading")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AttendanceFilters onFilterChange={handleFilterChange} />

      <BaseTable
        columns={columns}
        data={records}
        showPagination={true}
        noResultsText={t("messages.noRecords")}
        previousText={tCommon("previous")}
        nextText={tCommon("next")}
      />
    </div>
  );
}
