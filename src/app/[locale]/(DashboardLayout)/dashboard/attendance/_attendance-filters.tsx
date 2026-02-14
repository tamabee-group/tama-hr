"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  Users,
  Activity,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SelectItem } from "@/components/ui/select";
import { SelectWithIcon } from "@/components/ui/select-with-icon";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DatePicker } from "@/components/ui/date-picker";
import { apiClient } from "@/lib/utils/fetch-client";

import { UnifiedAttendanceFilters } from "@/lib/apis/unified-attendance-api";
import { ATTENDANCE_STATUSES } from "@/types/attendance-enums";
import { User } from "@/types/user";
import { PaginatedResponse } from "@/types/api";

interface AttendanceFiltersProps {
  onFilterChange: (filters: UnifiedAttendanceFilters) => void;
}

/**
 * Bộ lọc chấm công - responsive, auto-apply khi thay đổi
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
  const [isOpen, setIsOpen] = useState(false);

  // Danh sách nhân viên
  const [employees, setEmployees] = useState<User[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const response = await apiClient.get<PaginatedResponse<User>>(
          "/api/company/employees?page=0&size=100",
        );
        setEmployees(response.content);
      } catch {
        // Bỏ qua lỗi
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  // Ref để tránh infinite loop khi gọi onFilterChange
  const onFilterChangeRef = useRef(onFilterChange);
  onFilterChangeRef.current = onFilterChange;

  // Tạo filters object từ state hiện tại
  const buildFilters = (
    sd?: Date,
    ed?: Date,
    empId?: string,
    st?: string,
  ): UnifiedAttendanceFilters => {
    const filters: UnifiedAttendanceFilters = {};
    if (sd) filters.startDate = format(sd, "yyyy-MM-dd");
    if (ed) filters.endDate = format(ed, "yyyy-MM-dd");
    if (empId && empId !== "ALL") filters.employeeId = parseInt(empId);
    if (st && st !== "ALL") filters.status = st;
    return filters;
  };

  // Wrapper setters - cập nhật state và gọi onFilterChange
  const updateStartDate = (date: Date | undefined) => {
    setStartDate(date);
    onFilterChangeRef.current(buildFilters(date, endDate, employeeId, status));
  };
  const updateEndDate = (date: Date | undefined) => {
    setEndDate(date);
    onFilterChangeRef.current(
      buildFilters(startDate, date, employeeId, status),
    );
  };
  const updateEmployeeId = (value: string) => {
    setEmployeeId(value);
    onFilterChangeRef.current(buildFilters(startDate, endDate, value, status));
  };
  const updateStatus = (value: string) => {
    setStatus(value);
    onFilterChangeRef.current(
      buildFilters(startDate, endDate, employeeId, value),
    );
  };

  // Xóa tất cả bộ lọc
  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setEmployeeId("");
    setStatus("");
    onFilterChangeRef.current({});
  };

  // Xóa từng filter
  const clearStartDate = () => updateStartDate(undefined);
  const clearEndDate = () => updateEndDate(undefined);
  const clearEmployee = () => updateEmployeeId("");
  const clearStatus = () => updateStatus("");

  // Đếm số filter đang active
  const activeCount = [startDate, endDate, employeeId, status].filter(
    Boolean,
  ).length;

  // Tên nhân viên đang chọn
  const selectedEmployeeName = employeeId
    ? employees.find((e) => e.id.toString() === employeeId)?.profile?.name || ""
    : "";

  return (
    <div className="w-full space-y-2">
      {/* Desktop: hiển thị inline */}
      <div className="hidden md:flex items-center gap-2 flex-wrap">
        <FilterFields
          startDate={startDate}
          endDate={endDate}
          employeeId={employeeId}
          status={status}
          employees={employees}
          loadingEmployees={loadingEmployees}
          onStartDateChange={updateStartDate}
          onEndDateChange={updateEndDate}
          onEmployeeChange={updateEmployeeId}
          onStatusChange={updateStatus}
          t={t}
          tCommon={tCommon}
          tEnums={tEnums}
        />
        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9 px-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Mobile: collapsible */}
      <div className="md:hidden">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-between"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                {tCommon("filter")}
                {activeCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="h-5 min-w-5 px-1.5 text-xs"
                  >
                    {activeCount}
                  </Badge>
                )}
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <div className="grid grid-cols-2 gap-2">
              <DatePicker
                value={startDate}
                onChange={updateStartDate}
                placeholder={tCommon("from")}
                className="my-0"
              />
              <DatePicker
                value={endDate}
                onChange={updateEndDate}
                placeholder={tCommon("to")}
                className="my-0"
              />
              <SelectWithIcon
                value={employeeId}
                onValueChange={updateEmployeeId}
                placeholder={t("filter.employee")}
                icon={<Users className="h-4 w-4" />}
                className="col-span-2 my-0"
              >
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
              </SelectWithIcon>
              <SelectWithIcon
                value={status}
                onValueChange={updateStatus}
                placeholder={t("filter.status")}
                icon={<Activity className="h-4 w-4" />}
                className="col-span-2 my-0"
              >
                <SelectItem value="ALL">{tCommon("all")}</SelectItem>
                {ATTENDANCE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {tEnums(`attendanceStatus.${s}`)}
                  </SelectItem>
                ))}
              </SelectWithIcon>
              {activeCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="col-span-2 h-9 text-muted-foreground"
                >
                  <X className="mr-1.5 h-3.5 w-3.5" />
                  {tCommon("clearFilter")}
                </Button>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Active filter badges - hiển thị trên cả desktop và mobile */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {startDate && (
            <FilterBadge
              label={`${tCommon("from")}: ${format(startDate, "dd/MM/yyyy")}`}
              onClear={clearStartDate}
            />
          )}
          {endDate && (
            <FilterBadge
              label={`${tCommon("to")}: ${format(endDate, "dd/MM/yyyy")}`}
              onClear={clearEndDate}
            />
          )}
          {employeeId && employeeId !== "ALL" && (
            <FilterBadge
              label={selectedEmployeeName || employeeId}
              onClear={clearEmployee}
            />
          )}
          {status && status !== "ALL" && (
            <FilterBadge
              label={tEnums(`attendanceStatus.${status}`)}
              onClear={clearStatus}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

function FilterBadge({
  label,
  onClear,
}: {
  label: string;
  onClear: () => void;
}) {
  return (
    <Badge variant="secondary" className="gap-1 pr-1 text-xs font-normal">
      {label}
      <button
        onClick={onClear}
        className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}

interface FilterFieldsProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  employeeId: string;
  status: string;
  employees: User[];
  loadingEmployees: boolean;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onEmployeeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  t: ReturnType<typeof useTranslations>;
  tCommon: ReturnType<typeof useTranslations>;
  tEnums: ReturnType<typeof useTranslations>;
}

function FilterFields({
  startDate,
  endDate,
  employeeId,
  status,
  employees,
  loadingEmployees,
  onStartDateChange,
  onEndDateChange,
  onEmployeeChange,
  onStatusChange,
  t,
  tCommon,
  tEnums,
}: FilterFieldsProps) {
  return (
    <>
      <DatePicker
        value={startDate}
        onChange={onStartDateChange}
        placeholder={tCommon("from")}
        className="w-[150px] my-0"
      />
      <DatePicker
        value={endDate}
        onChange={onEndDateChange}
        placeholder={tCommon("to")}
        className="w-[150px] my-0"
      />
      <SelectWithIcon
        value={employeeId}
        onValueChange={onEmployeeChange}
        placeholder={t("filter.employee")}
        icon={<Users className="h-4 w-4" />}
        className="w-[180px] my-0"
      >
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
      </SelectWithIcon>
      <SelectWithIcon
        value={status}
        onValueChange={onStatusChange}
        placeholder={t("filter.status")}
        icon={<Activity className="h-4 w-4" />}
        className="w-[150px] my-0"
      >
        <SelectItem value="ALL">{tCommon("all")}</SelectItem>
        {ATTENDANCE_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {tEnums(`attendanceStatus.${s}`)}
          </SelectItem>
        ))}
      </SelectWithIcon>
    </>
  );
}
