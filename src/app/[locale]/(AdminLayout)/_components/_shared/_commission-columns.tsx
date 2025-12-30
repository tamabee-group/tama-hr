"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CommissionResponse } from "@/types/commission";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatDateTime } from "@/lib/utils/format-date";
import { CommissionStatus } from "@/types/enums";

/**
 * Component hiển thị trạng thái thanh toán
 * - PAID: "Đã thanh toán" (xanh lá)
 * - PENDING: "Chờ đủ điều kiện" (vàng)
 * - ELIGIBLE: "Chờ thanh toán" (xanh dương)
 */
function StatusBadge({ status }: { status: CommissionStatus }) {
  if (status === "PAID") {
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200">
        Đã thanh toán
      </Badge>
    );
  }

  if (status === "PENDING") {
    return (
      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200">
        Chờ đủ điều kiện
      </Badge>
    );
  }

  // ELIGIBLE - sẵn sàng thanh toán
  return (
    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200">
      Chờ thanh toán
    </Badge>
  );
}

/**
 * Columns cơ bản cho bảng hoa hồng - dùng chung cho cả admin và employee
 * Bao gồm: công ty, hoa hồng, trạng thái thanh toán, ngày tạo
 */
export const baseCommissionColumns: ColumnDef<CommissionResponse>[] = [
  {
    accessorKey: "companyName",
    header: "Công ty",
    cell: ({ row }) => row.getValue("companyName") || "-",
  },
  {
    accessorKey: "amount",
    header: "Số tiền thanh toán",
    cell: ({ row }) => formatCurrency(row.getValue("amount") || 0, "vi"),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  {
    accessorKey: "createdAt",
    header: "Ngày tạo",
    cell: ({ row }) => {
      const value = row.getValue("createdAt");
      return value ? formatDateTime(value as string, "vi") : "-";
    },
  },
];

/**
 * Column hiển thị thông tin nhân viên (chỉ dùng cho admin)
 */
const employeeColumn: ColumnDef<CommissionResponse> = {
  accessorKey: "employeeName",
  header: "Nhân viên",
  cell: ({ row }) => (
    <div>
      <span className="font-medium">{row.getValue("employeeName") || "-"}</span>
      <span className="text-xs text-muted-foreground block">
        {row.original.employeeCode || ""}
      </span>
    </div>
  ),
};

/**
 * Callbacks cho các action trong bảng commission
 */
export interface CommissionActionCallbacks {
  onViewDetail: (id: number) => void;
  onMarkAsPaid?: (id: number) => void;
  markingPaid?: number | null;
}

/**
 * Factory function tạo columns cho admin với actions "Xem chi tiết" và "Đã thanh toán"
 * Pay button chỉ enable khi status = ELIGIBLE
 * @param callbacks - Các callback cho actions
 * @returns Mảng columns bao gồm: nhân viên, columns cơ bản, và action column
 */
export function createAdminCommissionColumns(
  callbacks: CommissionActionCallbacks,
): ColumnDef<CommissionResponse>[] {
  const { onViewDetail, onMarkAsPaid, markingPaid } = callbacks;

  const actionColumn: ColumnDef<CommissionResponse> = {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const commission = row.original;
      const isPaid = commission.status === "PAID";
      const isEligible = commission.status === "ELIGIBLE";
      const isProcessing = markingPaid === commission.id;

      return (
        <div className="flex items-center gap-2">
          {/* Nút xem chi tiết */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetail(commission.id)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Chi tiết
          </Button>

          {/* Nút đã thanh toán - chỉ hiển thị khi chưa thanh toán */}
          {!isPaid && onMarkAsPaid && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMarkAsPaid(commission.id)}
                      disabled={!isEligible || isProcessing}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Đã thanh toán
                    </Button>
                  </span>
                </TooltipTrigger>
                {!isEligible && (
                  <TooltipContent>
                    <p>Chưa đủ điều kiện thanh toán</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      );
    },
  };

  return [employeeColumn, ...baseCommissionColumns, actionColumn];
}

/**
 * Factory function tạo columns cho employee (chỉ có xem chi tiết, không có thanh toán)
 * @param onViewDetail - Callback khi click nút "Chi tiết"
 * @returns Mảng columns cơ bản với action xem chi tiết
 */
export function createEmployeeCommissionColumns(
  onViewDetail: (id: number) => void,
): ColumnDef<CommissionResponse>[] {
  const actionColumn: ColumnDef<CommissionResponse> = {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const commission = row.original;
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetail(commission.id)}
        >
          <Eye className="h-4 w-4 mr-1" />
          Chi tiết
        </Button>
      );
    },
  };

  return [...baseCommissionColumns, actionColumn];
}
