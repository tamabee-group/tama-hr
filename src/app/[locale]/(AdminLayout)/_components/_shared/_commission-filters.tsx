"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Search } from "lucide-react";
import { CommissionStatus, COMMISSION_STATUSES } from "@/types/enums";

/**
 * Props cho CommissionFilters component
 */
interface CommissionFiltersProps {
  /** Hiển thị filter theo employee code (chỉ admin) */
  showEmployeeFilter?: boolean;
  /** Giá trị filter employee code */
  employeeCodeFilter: string;
  /** Giá trị filter status */
  statusFilter: CommissionStatus | "ALL";
  /** Ngày bắt đầu */
  startDate?: Date;
  /** Ngày kết thúc */
  endDate?: Date;
  /** Callback khi thay đổi employee code */
  onEmployeeCodeChange: (value: string) => void;
  /** Callback khi nhấn Enter để search */
  onEmployeeCodeSearch: () => void;
  /** Callback khi thay đổi status */
  onStatusChange: (value: CommissionStatus | "ALL") => void;
  /** Callback khi thay đổi ngày bắt đầu */
  onStartDateChange: (date: Date | undefined) => void;
  /** Callback khi thay đổi ngày kết thúc */
  onEndDateChange: (date: Date | undefined) => void;
}

/**
 * Component filter cho bảng hoa hồng
 * Bao gồm: filter employee code (admin), status, date range
 */
export function CommissionFilters({
  showEmployeeFilter = false,
  employeeCodeFilter,
  statusFilter,
  startDate,
  endDate,
  onEmployeeCodeChange,
  onEmployeeCodeSearch,
  onStatusChange,
  onStartDateChange,
  onEndDateChange,
}: CommissionFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Employee code filter - chỉ hiển thị cho admin */}
      {showEmployeeFilter && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã nhân viên"
            value={employeeCodeFilter}
            onChange={(e) => onEmployeeCodeChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onEmployeeCodeSearch()}
            className="pl-9 w-48 h-9"
          />
        </div>
      )}

      {/* Status filter */}
      <Select
        value={statusFilter}
        onValueChange={(value) =>
          onStatusChange(value as CommissionStatus | "ALL")
        }
      >
        <SelectTrigger className="w-40 h-9">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tất cả</SelectItem>
          {COMMISSION_STATUSES.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date range filter */}
      <DatePicker
        value={startDate}
        onChange={onStartDateChange}
        placeholder="Từ ngày"
        className="w-40 h-9"
      />
      <DatePicker
        value={endDate}
        onChange={onEndDateChange}
        placeholder="Đến ngày"
        className="w-40 h-9"
      />
    </div>
  );
}
