"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarIcon, Search, X } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

import { AttendanceFilters as AttendanceFilterParams } from "@/lib/apis/attendance-api";
import { ATTENDANCE_STATUSES } from "@/types/attendance-enums";

interface AttendanceFiltersProps {
  onFilterChange: (filters: AttendanceFilterParams) => void;
}

/**
 * Component filters cho bảng chấm công
 * Bao gồm: date range, employee search, status filter
 */
export function AttendanceFilters({ onFilterChange }: AttendanceFiltersProps) {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");

  // Filter states
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [status, setStatus] = useState<string>("");

  // Apply filters
  const applyFilters = () => {
    const filters: AttendanceFilterParams = {};

    if (startDate) {
      filters.startDate = format(startDate, "yyyy-MM-dd");
    }
    if (endDate) {
      filters.endDate = format(endDate, "yyyy-MM-dd");
    }
    if (status && status !== "ALL") {
      filters.status = status;
    }

    onFilterChange(filters);
  };

  // Clear all filters
  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setEmployeeSearch("");
    setStatus("");
    onFilterChange({});
  };

  // Check if any filter is active
  const hasActiveFilters = startDate || endDate || employeeSearch || status;

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg">
      {/* Date Range - Start */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[160px] justify-start text-left font-normal",
              !startDate && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate ? format(startDate, "dd/MM/yyyy") : tCommon("from")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={setStartDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Date Range - End */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[160px] justify-start text-left font-normal",
              !endDate && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {endDate ? format(endDate, "dd/MM/yyyy") : tCommon("to")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={setEndDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Employee Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("filter.employee")}
          value={employeeSearch}
          onChange={(e) => setEmployeeSearch(e.target.value)}
          className="pl-9 w-[200px]"
        />
      </div>

      {/* Status Filter */}
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder={t("filter.status")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{tCommon("all")}</SelectItem>
          {ATTENDANCE_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {tEnums(`attendanceStatus.${s}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Action Buttons */}
      <Button onClick={applyFilters} size="sm">
        <Search className="h-4 w-4 mr-1" />
        {tCommon("filter")}
      </Button>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          {tCommon("clearFilter")}
        </Button>
      )}
    </div>
  );
}
