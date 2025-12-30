"use client";

import { useState, useEffect } from "react";
import {
  CommissionResponse,
  CommissionFilterRequest,
} from "@/types/commission";
import { PaginatedResponse } from "@/types/api";
import { CommissionStatus } from "@/types/enums";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_PAGE_SIZE } from "@/types/api";
import { handleApiError } from "@/lib/utils/api-error-handler";
import { toast } from "sonner";
import { format } from "date-fns";
import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { Pagination } from "@/app/[locale]/_components/_base/_pagination";
import {
  baseCommissionColumns,
  createAdminCommissionColumns,
  createEmployeeCommissionColumns,
} from "./_commission-columns";
import { CommissionFilters } from "./_commission-filters";
import { CommissionPayDialog } from "./_commission-pay-dialog";
import { CommissionDetailDialog } from "./_commission-detail-dialog";

/**
 * Props cho CommissionTable component dùng chung
 * Hỗ trợ cả admin (có filter employee, mark as paid) và employee (read-only)
 */
interface CommissionTableProps {
  /** Hàm fetch commissions với filter và pagination */
  fetchCommissions: (
    filter: CommissionFilterRequest,
    page: number,
    size: number,
  ) => Promise<PaginatedResponse<CommissionResponse>>;
  /** Hiển thị filter theo employee code (chỉ admin) */
  showEmployeeFilter?: boolean;
  /** Hiển thị nút "Đã thanh toán" (chỉ admin) */
  showMarkAsPaid?: boolean;
  /** Callback khi mark as paid thành công */
  onMarkAsPaid?: (id: number) => Promise<void>;
  /** Trigger refresh từ parent */
  refreshTrigger?: number;
  /** Callback sau khi refresh */
  onRefresh?: () => void;
}

/**
 * Component bảng hiển thị danh sách hoa hồng dùng chung
 * - Admin: showEmployeeFilter=true, showMarkAsPaid=true
 * - Employee: showEmployeeFilter=false, showMarkAsPaid=false (read-only)
 */
export function CommissionTable({
  fetchCommissions,
  showEmployeeFilter = false,
  showMarkAsPaid = false,
  onMarkAsPaid,
  refreshTrigger,
  onRefresh,
}: CommissionTableProps) {
  const [commissions, setCommissions] = useState<CommissionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [markingPaid, setMarkingPaid] = useState<number | null>(null);

  // Dialog state
  const [selectedCommission, setSelectedCommission] =
    useState<CommissionResponse | null>(null);
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Filter state
  const [employeeCodeFilter, setEmployeeCodeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<CommissionStatus | "ALL">(
    "ALL",
  );
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  /** Fetch danh sách commissions với filter hiện tại */
  const loadCommissions = async () => {
    setLoading(true);
    try {
      const filter: CommissionFilterRequest = {};
      if (showEmployeeFilter && employeeCodeFilter) {
        filter.employeeCode = employeeCodeFilter;
      }
      if (statusFilter !== "ALL") filter.status = statusFilter;
      if (startDate) filter.startDate = format(startDate, "yyyy-MM-dd");
      if (endDate) filter.endDate = format(endDate, "yyyy-MM-dd");

      const response = await fetchCommissions(filter, page, DEFAULT_PAGE_SIZE);
      setCommissions(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to fetch commissions:", error);
      handleApiError(error, {
        defaultMessage: "Không thể tải danh sách hoa hồng",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, refreshTrigger]);

  /** Xử lý khi thay đổi filter - reset về trang đầu */
  const handleFilterChange = () => {
    setPage(0);
    loadCommissions();
  };

  /** Mở dialog xác nhận thanh toán */
  const handleOpenPayDialog = (id: number) => {
    const commission = commissions.find((c) => c.id === id);
    if (commission) {
      setSelectedCommission(commission);
      setShowPayDialog(true);
    }
  };

  /** Mở dialog xem chi tiết */
  const handleOpenDetailDialog = (id: number) => {
    const commission = commissions.find((c) => c.id === id);
    if (commission) {
      setSelectedCommission(commission);
      setShowDetailDialog(true);
    }
  };

  /** Xử lý xác nhận thanh toán từ dialog */
  const handleConfirmPay = async () => {
    if (!selectedCommission || !onMarkAsPaid) return;

    setMarkingPaid(selectedCommission.id);
    try {
      await onMarkAsPaid(selectedCommission.id);
      toast.success("Đã đánh dấu thanh toán thành công");
      loadCommissions();
      onRefresh?.();
    } catch (error) {
      console.error("Failed to mark as paid:", error);
      handleApiError(error, {
        forbiddenMessage: "Bạn không có quyền đánh dấu thanh toán",
        defaultMessage: "Không thể đánh dấu thanh toán",
      });
      throw error; // Re-throw để dialog biết có lỗi
    } finally {
      setMarkingPaid(null);
    }
  };

  /** Lấy columns phù hợp với role */
  const getColumns = () => {
    if (showMarkAsPaid && onMarkAsPaid) {
      return createAdminCommissionColumns({
        onViewDetail: handleOpenDetailDialog,
        onMarkAsPaid: handleOpenPayDialog,
        markingPaid,
      });
    }
    return createEmployeeCommissionColumns(handleOpenDetailDialog);
  };

  // Loading skeleton
  if (loading && commissions.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          {showEmployeeFilter && <Skeleton className="h-9 w-48" />}
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <CommissionFilters
        showEmployeeFilter={showEmployeeFilter}
        employeeCodeFilter={employeeCodeFilter}
        statusFilter={statusFilter}
        startDate={startDate}
        endDate={endDate}
        onEmployeeCodeChange={setEmployeeCodeFilter}
        onEmployeeCodeSearch={handleFilterChange}
        onStatusChange={(value) => {
          setStatusFilter(value);
          setTimeout(handleFilterChange, 0);
        }}
        onStartDateChange={(date) => {
          setStartDate(date);
          setTimeout(handleFilterChange, 0);
        }}
        onEndDateChange={(date) => {
          setEndDate(date);
          setTimeout(handleFilterChange, 0);
        }}
      />

      {/* Table */}
      {commissions.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          Không có hoa hồng nào
        </div>
      ) : (
        <BaseTable
          columns={getColumns()}
          data={commissions}
          showPagination={false}
          noResultsText="Không có hoa hồng nào"
        />
      )}

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Pay Confirmation Dialog */}
      <CommissionPayDialog
        open={showPayDialog}
        onOpenChange={setShowPayDialog}
        commission={selectedCommission}
        onConfirm={handleConfirmPay}
      />

      {/* Detail Dialog */}
      <CommissionDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        commission={selectedCommission}
      />
    </div>
  );
}
