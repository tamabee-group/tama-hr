"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Plus, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { LeaveBalanceTable } from "./_leave-balance-table";
import { UpdateBalanceDialog } from "./_update-balance-dialog";
import { BulkAllocateDialog } from "./_bulk-allocate-dialog";
import {
  getAllLeaveBalances,
  LeaveBalanceSummaryResponse,
} from "@/lib/apis/leave-balance-api";
import { getErrorMessage } from "@/lib/utils/get-error-message";

const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 20;

/**
 * Component chính quản lý số ngày nghỉ phép
 * Hiển thị danh sách nhân viên với số ngày phép theo năm
 */
export function LeaveBalanceContent() {
  const t = useTranslations("leaveBalance");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");

  // State cho data
  const [balances, setBalances] = useState<LeaveBalanceSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // State cho filters
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString(),
  );
  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // State cho dialogs
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState<LeaveBalanceSummaryResponse | null>(null);

  // Debounce search keyword
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchKeyword);
      setPage(DEFAULT_PAGE); // Reset về trang đầu khi search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // Fetch data
  const fetchBalances = useCallback(async () => {
    setLoading(true);
    try {
      const year = parseInt(selectedYear);
      const response = await getAllLeaveBalances(
        year,
        debouncedSearch || undefined,
        page,
        DEFAULT_SIZE,
      );
      setBalances(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setLoading(false);
    }
  }, [selectedYear, debouncedSearch, page, tErrors]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  // Tạo danh sách năm (năm hiện tại ± 2 năm)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // Handle year change
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setPage(DEFAULT_PAGE);
  };

  // Handle edit click
  const handleEditClick = (employee: LeaveBalanceSummaryResponse) => {
    setSelectedEmployee(employee);
    setUpdateDialogOpen(true);
  };

  // Handle dialog success
  const handleDialogSuccess = () => {
    setUpdateDialogOpen(false);
    setBulkDialogOpen(false);
    setSelectedEmployee(null);
    fetchBalances();
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (loading && balances.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span className="text-muted-foreground">{tCommon("loading")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar: Filters và Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          {/* Year filter */}
          <Select value={selectedYear} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder={t("filter.year")} />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search input */}
          <div className="relative flex-1 sm:w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("filter.search")}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="pl-9"
              textTransform="none"
            />
          </div>
        </div>

        {/* Bulk allocate button */}
        <Button onClick={() => setBulkDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t("bulkAllocate")}
        </Button>
      </div>

      {/* Table */}
      <LeaveBalanceTable
        data={balances}
        page={page}
        pageSize={DEFAULT_SIZE}
        totalElements={totalElements}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onEdit={handleEditClick}
      />

      {/* Update Balance Dialog */}
      <UpdateBalanceDialog
        employee={selectedEmployee}
        year={parseInt(selectedYear)}
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        onSuccess={handleDialogSuccess}
      />

      {/* Bulk Allocate Dialog */}
      <BulkAllocateDialog
        year={parseInt(selectedYear)}
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
}
