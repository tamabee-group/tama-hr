"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  TransactionType,
  TRANSACTION_TYPES,
  getTransactionTypeLabel,
} from "@/types/enums";
import { SupportedLocale } from "@/lib/utils/format-currency";

/**
 * Props cho TransactionFilters component
 */
interface TransactionFiltersProps {
  /** Loại giao dịch đang filter */
  transactionType?: TransactionType;
  /** Ngày bắt đầu */
  startDate?: Date;
  /** Ngày kết thúc */
  endDate?: Date;
  /** Locale cho hiển thị label */
  locale?: SupportedLocale;
  /** Callback khi thay đổi loại giao dịch */
  onTypeChange: (value: string) => void;
  /** Callback khi thay đổi ngày bắt đầu */
  onStartDateChange: (date: Date | undefined) => void;
  /** Callback khi thay đổi ngày kết thúc */
  onEndDateChange: (date: Date | undefined) => void;
  /** Callback khi xóa tất cả filter */
  onClearFilters: () => void;
}

/**
 * Component filter cho bảng giao dịch
 * Bao gồm: filter loại giao dịch, ngày bắt đầu, ngày kết thúc
 */
export function TransactionFilters({
  transactionType,
  startDate,
  endDate,
  locale = "vi",
  onTypeChange,
  onStartDateChange,
  onEndDateChange,
  onClearFilters,
}: TransactionFiltersProps) {
  const hasActiveFilters = transactionType || startDate || endDate;

  return (
    <div className="flex flex-wrap gap-4 items-center">
      {/* Transaction Type Filter */}
      <Select value={transactionType || "ALL"} onValueChange={onTypeChange}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Tất cả loại" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tất cả loại</SelectItem>
          {TRANSACTION_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {getTransactionTypeLabel(type.value, locale)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Start Date Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-44 justify-start text-left font-normal",
              !startDate && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate ? format(startDate, "dd/MM/yyyy") : "Từ ngày"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={onStartDateChange}
            locale={vi}
            autoFocus
          />
        </PopoverContent>
      </Popover>

      {/* End Date Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-44 justify-start text-left font-normal",
              !endDate && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {endDate ? format(endDate, "dd/MM/yyyy") : "Đến ngày"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={onEndDateChange}
            locale={vi}
            autoFocus
          />
        </PopoverContent>
      </Popover>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          <X className="h-4 w-4 mr-1" />
          Xóa bộ lọc
        </Button>
      )}
    </div>
  );
}
