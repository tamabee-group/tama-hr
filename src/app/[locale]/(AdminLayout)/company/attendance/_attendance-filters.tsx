"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { CalendarIcon, Search, X, Users } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
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
import { apiClient } from "@/lib/utils/fetch-client";

import { UnifiedAttendanceFilters } from "@/lib/apis/unified-attendance-api";
import { ATTENDANCE_STATUSES } from "@/types/attendance-enums";
import { User } from "@/types/user";
import { PaginatedResponse } from "@/types/api";

interface AttendanceFiltersProps {
  onFilterChange: (filters: UnifiedAttendanceFilters) => void;
}

/**
 * Component filters cho bảng chấm công
 * Bao gồm: date range, employee select, status filter
 */
export function AttendanceFilters({ onFilterChange }: AttendanceFiltersProps) {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");

  // Filter states
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [employeeId, setEmployeeId] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  // Employee list for dropdown
  const [employees, setEmployees] = useState<User[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Fetch employees for filter dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const response = await apiClient.get<PaginatedResponse<User>>(
          "/api/company/employees?page=0&size=100",
        );
        setEmployees(response.content);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  // Apply filters
  const applyFilters = () => {
    const filters: UnifiedAttendanceFilters = {};

    if (startDate) {
      filters.startDate = format(startDate, "yyyy-MM-dd");
    }
    if (endDate) {
      filters.endDate = format(endDate, "yyyy-MM-dd");
    }
    if (employeeId && employeeId !== "ALL") {
      filters.employeeId = parseInt(employeeId);
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
    setEmployeeId("");
    setStatus("");
    onFilterChange({});
  };

  // Check if any filter is active
  const hasActiveFilters = startDate || endDate || employeeId || status;

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

      {/* Employee Filter */}
      <Select value={employeeId} onValueChange={setEmployeeId}>
        <SelectTrigger className="w-[200px]">
          <Users className="mr-2 h-4 w-4" />
          <SelectValue placeholder={t("filter.employee")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{tCommon("all")}</SelectItem>
          {loadingEmployees ? (
            <SelectItem value="__loading__" disabled>
              {tCommon("loading")}
            </SelectItem>
          ) : (
            employees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id.toString()}>
                {emp.profile?.name || emp.email}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

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
