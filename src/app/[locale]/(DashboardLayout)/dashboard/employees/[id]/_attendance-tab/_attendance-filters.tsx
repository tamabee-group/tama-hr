"use client";

import { useTranslations } from "next-intl";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ATTENDANCE_STATUSES } from "@/types/attendance-enums";

interface AttendanceFiltersProps {
  year: number;
  month: number;
  statusFilter: string;
  onMonthChange: (year: number, month: number) => void;
  onStatusChange: (status: string) => void;
  onExportCSV: () => void;
}

/**
 * Component filter cho Attendance Tab
 * Bao gồm: Month selector, Status filter, Export CSV
 */
export function AttendanceFilters({
  year,
  month,
  statusFilter,
  onMonthChange,
  onStatusChange,
  onExportCSV,
}: AttendanceFiltersProps) {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");

  // Handle previous month
  const handlePreviousMonth = () => {
    if (month === 1) {
      onMonthChange(year - 1, 12);
    } else {
      onMonthChange(year, month - 1);
    }
  };

  // Handle next month
  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(year + 1, 1);
    } else {
      onMonthChange(year, month + 1);
    }
  };

  return (
    <div className="flex gap-2 justify-between">
      {/* Left side: Month selector */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-medium min-w-[80px] text-center">
          {year}/{month.toString().padStart(2, "0")}
        </span>
        <Button variant="outline" size="icon" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Right side: Filters and Export */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Status filter */}
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder={t("filter.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tCommon("all")}</SelectItem>
            {ATTENDANCE_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {tEnums(`attendanceStatus.${status}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Export CSV */}
        <Button variant="outline" size="icon" onClick={onExportCSV}>
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
