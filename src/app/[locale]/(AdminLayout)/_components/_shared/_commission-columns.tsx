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
import { getCommissionStatusLabel } from "@/lib/utils/get-enum-label";

/**
 * Component hiển thị trạng thái thanh toán
 * - PAID: "Đã thanh toán" (xanh lá)
 * - PENDING: "Chờ đủ điều kiện" (vàng)
 * - ELIGIBLE: "Chờ thanh toán" (xanh dương)
 */
interface StatusBadgeProps {
  status: CommissionStatus;
  tEnums: (key: string) => string;
}

function StatusBadge({ status, tEnums }: StatusBadgeProps) {
  const label = getCommissionStatusLabel(status, tEnums);

  if (status === "PAID") {
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200">
        {label}
      </Badge>
    );
  }

  if (status === "PENDING") {
    return (
      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200">
        {label}
      </Badge>
    );
  }

  // ELIGIBLE - sẵn sàng thanh toán
  return (
    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200">
      {label}
    </Badge>
  );
}

/**
 * Translation functions interface cho columns
 */
export interface CommissionColumnTranslations {
  t: (key: string) => string;
  tCommon: (key: string) => string;
  tEnums: (key: string) => string;
  locale: string;
}

/**
 * Factory function tạo columns cơ bản cho bảng hoa hồng
 * Bao gồm: công ty, hoa hồng, trạng thái thanh toán, ngày tạo
 */
export function createBaseCommissionColumns(
  translations: CommissionColumnTranslations,
): ColumnDef<CommissionResponse>[] {
  const { t, tCommon, tEnums, locale } = translations;

  return [
    {
      accessorKey: "companyName",
      header: t("table.company"),
      cell: ({ row }) => row.getValue("companyName") || "-",
    },
    {
      accessorKey: "amount",
      header: t("table.amount"),
      cell: ({ row }) =>
        formatCurrency(
          row.getValue("amount") || 0,
          locale as "vi" | "en" | "ja",
        ),
    },
    {
      accessorKey: "status",
      header: tCommon("status"),
      cell: ({ row }) => (
        <StatusBadge status={row.getValue("status")} tEnums={tEnums} />
      ),
    },
    {
      accessorKey: "createdAt",
      header: tCommon("createdAt"),
      cell: ({ row }) => {
        const value = row.getValue("createdAt");
        return value
          ? formatDateTime(value as string, locale as "vi" | "en" | "ja")
          : "-";
      },
    },
  ];
}

/**
 * Factory function tạo column hiển thị thông tin nhân viên (chỉ dùng cho admin)
 */
function createEmployeeColumn(
  t: (key: string) => string,
): ColumnDef<CommissionResponse> {
  return {
    accessorKey: "employeeName",
    header: t("table.referredBy"),
    cell: ({ row }) => (
      <div>
        <span className="font-medium">
          {row.getValue("employeeName") || "-"}
        </span>
        <span className="text-xs text-muted-foreground block">
          {row.original.employeeCode || ""}
        </span>
      </div>
    ),
  };
}

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
 * @param translations - Translation functions
 * @returns Mảng columns bao gồm: nhân viên, columns cơ bản, và action column
 */
export function createAdminCommissionColumns(
  callbacks: CommissionActionCallbacks,
  translations: CommissionColumnTranslations,
): ColumnDef<CommissionResponse>[] {
  const { onViewDetail, onMarkAsPaid, markingPaid } = callbacks;
  const { t, tCommon } = translations;

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
            {tCommon("details")}
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
                      {t("actions.markPaid")}
                    </Button>
                  </span>
                </TooltipTrigger>
                {!isEligible && (
                  <TooltipContent>
                    <p>{t("payDialog.notEligibleTitle")}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      );
    },
  };

  const employeeColumn = createEmployeeColumn(t);
  const baseColumns = createBaseCommissionColumns(translations);

  return [employeeColumn, ...baseColumns, actionColumn];
}

/**
 * Factory function tạo columns cho employee (chỉ có xem chi tiết, không có thanh toán)
 * @param onViewDetail - Callback khi click nút "Chi tiết"
 * @param translations - Translation functions
 * @returns Mảng columns cơ bản với action xem chi tiết
 */
export function createEmployeeCommissionColumns(
  onViewDetail: (id: number) => void,
  translations: CommissionColumnTranslations,
): ColumnDef<CommissionResponse>[] {
  const { tCommon } = translations;

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
          {tCommon("details")}
        </Button>
      );
    },
  };

  const baseColumns = createBaseCommissionColumns(translations);
  return [...baseColumns, actionColumn];
}
