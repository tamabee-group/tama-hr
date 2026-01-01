"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { AttendanceStatusBadge } from "@/app/[locale]/_components/_shared/_status-badge";
import { attendanceApi } from "@/lib/apis/attendance-api";
import { formatDate, formatTime } from "@/lib/utils/format-date";
import type { AttendanceRecord } from "@/types/attendance-records";
import type { SupportedLocale } from "@/lib/utils/format-currency";

// ============================================
// Constants
// ============================================

const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 10;

// ============================================
// Utilities
// ============================================

function formatMinutesToHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// ============================================
// AttendanceHistory Component
// ============================================

export function AttendanceHistory() {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();

  const [records, setRecords] = React.useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [page, setPage] = React.useState(DEFAULT_PAGE);
  const [totalPages, setTotalPages] = React.useState(0);
  const [totalElements, setTotalElements] = React.useState(0);

  // Fetch attendance records
  React.useEffect(() => {
    const fetchRecords = async () => {
      try {
        setIsLoading(true);
        const response = await attendanceApi.getMyAttendanceRecords(
          page,
          DEFAULT_LIMIT,
        );
        setRecords(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } catch (error) {
        console.error("Error fetching attendance records:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecords();
  }, [page]);

  // Xử lý khi click vào record
  const handleViewDetail = (record: AttendanceRecord) => {
    router.push(`/${locale}/employee/attendance/${record.workDate}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("history")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("history")}</CardTitle>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t("messages.noRecords")}
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">#</TableHead>
                    <TableHead>{t("table.date")}</TableHead>
                    <TableHead>{t("table.checkInTime")}</TableHead>
                    <TableHead>{t("table.checkOutTime")}</TableHead>
                    <TableHead>{t("table.workingHours")}</TableHead>
                    <TableHead>{t("table.overtime")}</TableHead>
                    <TableHead>{t("table.status")}</TableHead>
                    <TableHead className="w-[80px]">
                      {tCommon("actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record, index) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {page * DEFAULT_LIMIT + index + 1}
                      </TableCell>
                      <TableCell>
                        {formatDate(record.workDate, locale)}
                      </TableCell>
                      <TableCell>
                        {record.originalCheckIn
                          ? formatTime(record.originalCheckIn)
                          : "-"}
                        {record.lateMinutes > 0 && (
                          <span className="ml-2 text-xs text-orange-600">
                            (+{record.lateMinutes}m)
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.originalCheckOut
                          ? formatTime(record.originalCheckOut)
                          : "-"}
                        {record.earlyLeaveMinutes > 0 && (
                          <span className="ml-2 text-xs text-yellow-600">
                            (-{record.earlyLeaveMinutes}m)
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatMinutesToHours(record.workingMinutes)}
                      </TableCell>
                      <TableCell>
                        {record.overtimeMinutes > 0
                          ? formatMinutesToHours(record.overtimeMinutes)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <AttendanceStatusBadge status={record.status} />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetail(record)}
                          title={tCommon("view")}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                {tCommon("total")}: {totalElements}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  {page + 1} / {Math.max(1, totalPages)}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={page >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
