"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, ArrowUpDown } from "lucide-react";
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
import { AttendanceFilters } from "./_attendance-filters";

import {
  unifiedAttendanceApi,
  UnifiedAttendanceFilters,
} from "@/lib/apis/unified-attendance-api";
import { UnifiedAttendanceRecord } from "@/types/attendance-records";
import { formatDateWithDayOfWeek } from "@/lib/utils/format-date";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import type { SupportedLocale } from "@/lib/utils/format-currency";

const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 20;

/**
 * Component bảng chấm công của tất cả nhân viên
 * Sử dụng Unified Attendance API để hiển thị attendance + break records
 */
export function AttendanceTable() {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();

  // State
  const [records, setRecords] = useState<UnifiedAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState<UnifiedAttendanceFilters>({});

  // Fetch unified attendance records
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const response = await unifiedAttendanceApi.getCompanyAttendance(
        page,
        DEFAULT_LIMIT,
        filters,
      );
      setRecords(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
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
  const handleFilterChange = (newFilters: UnifiedAttendanceFilters) => {
    setFilters(newFilters);
    setPage(DEFAULT_PAGE);
  };

  // Handle row click - redirect to detail page
  const handleRowClick = (record: UnifiedAttendanceRecord) => {
    router.push(`/${locale}/dashboard/attendance/${record.id}`);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Define columns với sorting
  const columns: ColumnDef<UnifiedAttendanceRecord>[] = [
    {
      id: "stt",
      header: "#",
      cell: ({ row }) => page * DEFAULT_LIMIT + row.index + 1,
      size: 60,
    },
    {
      accessorKey: "employeeName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          {t("table.employee")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.employeeName}</span>
      ),
    },
    {
      accessorKey: "workDate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          {t("table.date")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatDateWithDayOfWeek(row.original.workDate, locale),
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
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          {t("table.workingHours")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
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
      accessorKey: "totalBreakMinutes",
      header: t("table.breakDuration"),
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
  ];

  return (
    <div className="space-y-4">
      <AttendanceFilters onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <span className="text-muted-foreground">{tCommon("loading")}</span>
        </div>
      ) : (
        <BaseTable
          columns={columns}
          data={records}
          showPagination={true}
          pageSize={DEFAULT_LIMIT}
          serverPagination={{
            page,
            totalPages,
            totalElements,
            onPageChange: handlePageChange,
          }}
          noResultsText={t("messages.noRecords")}
          previousText={tCommon("previous")}
          nextText={tCommon("next")}
          onRowClick={handleRowClick}
        />
      )}
    </div>
  );
}
