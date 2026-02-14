"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { MapPin } from "lucide-react";

import { AttendanceRecordsTable } from "@/app/[locale]/_components/_shared/attendance";
import { AttendanceFilters } from "./_attendance-filters";
import { Button } from "@/components/ui/button";

import {
  unifiedAttendanceApi,
  UnifiedAttendanceFilters,
} from "@/lib/apis/unified-attendance-api";
import { UnifiedAttendanceRecord } from "@/types/attendance-records";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import type { SupportedLocale } from "@/lib/utils/format-currency";

const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 20;

/**
 * Component bảng chấm công của tất cả nhân viên
 * Sử dụng Unified Attendance API để hiển thị attendance + break records
 */
export function AttendanceTable() {
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const t = useTranslations("attendance");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();

  // State
  const [records, setRecords] = useState<UnifiedAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState<UnifiedAttendanceFilters>({});
  const [showLocation, setShowLocation] = useState(false);

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
    router.push(
      `/${locale}/dashboard/attendance/${record.workDate}?employeeId=${record.employeeId}`,
    );
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2 md:space-y-0">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <AttendanceFilters onFilterChange={handleFilterChange} />
          </div>
          {/* Desktop: nút inline cạnh bộ lọc */}
          <Button
            variant={showLocation ? "default" : "outline"}
            size="sm"
            onClick={() => setShowLocation(!showLocation)}
            className="mb-2 shrink-0 h-9 hidden md:flex"
          >
            <MapPin className="mr-1.5 h-4 w-4" />
            {t("viewLocation")}
          </Button>
        </div>
        {/* Mobile: nút bên dưới bộ lọc */}
        <Button
          variant={showLocation ? "default" : "outline"}
          size="sm"
          onClick={() => setShowLocation(!showLocation)}
          className="h-9 w-full md:hidden"
        >
          <MapPin className="mr-1.5 h-4 w-4" />
          {t("viewLocation")}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <span className="text-muted-foreground">{tCommon("loading")}</span>
        </div>
      ) : (
        <AttendanceRecordsTable
          records={records}
          showEmployeeName={true}
          compact={true}
          enableSorting={true}
          showLocation={showLocation}
          onRowClick={handleRowClick}
          serverPagination={{
            page,
            totalPages,
            totalElements,
            pageSize: DEFAULT_LIMIT,
            onPageChange: handlePageChange,
          }}
        />
      )}
    </div>
  );
}
