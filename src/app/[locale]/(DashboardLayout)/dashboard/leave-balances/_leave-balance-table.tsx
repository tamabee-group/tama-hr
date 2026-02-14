"use client";

import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";

import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { Button } from "@/components/ui/button";
import { LeaveBalanceSummaryResponse } from "@/lib/apis/leave-balance-api";
import { LeaveType } from "@/types/attendance-enums";
import { getEnumLabel } from "@/lib/utils/get-enum-label";

interface LeaveBalanceTableProps {
  data: LeaveBalanceSummaryResponse[];
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (employee: LeaveBalanceSummaryResponse) => void;
}

/**
 * Component bảng hiển thị số ngày phép của nhân viên
 * Columns: STT, Nhân viên, Mã NV, Phép năm (Cấp/Dùng/Còn), Phép ốm (Cấp/Dùng/Còn), Actions
 */
export function LeaveBalanceTable({
  data,
  page,
  pageSize,
  totalElements,
  totalPages,
  onPageChange,
  onEdit,
}: LeaveBalanceTableProps) {
  const t = useTranslations("leaveBalance");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");

  /**
   * Lấy thông tin balance theo loại phép
   * Trả về chuỗi format: "Cấp / Dùng / Còn"
   */
  const getBalanceDisplay = (
    employee: LeaveBalanceSummaryResponse,
    leaveType: LeaveType,
  ): string => {
    const balance = employee.balances.find((b) => b.leaveType === leaveType);
    if (!balance) {
      return "0 / 0 / 0";
    }
    return `${balance.totalDays} / ${balance.usedDays} / ${balance.remainingDays}`;
  };

  /**
   * Lấy màu hiển thị dựa trên số ngày còn lại
   */
  const getBalanceColor = (
    employee: LeaveBalanceSummaryResponse,
    leaveType: LeaveType,
  ): string => {
    const balance = employee.balances.find((b) => b.leaveType === leaveType);
    if (!balance || balance.totalDays === 0) {
      return "text-muted-foreground";
    }
    // Nếu còn ít hơn 20% số ngày phép thì hiển thị màu cảnh báo
    const ratio = balance.remainingDays / balance.totalDays;
    if (ratio <= 0) {
      return "text-destructive";
    }
    if (ratio <= 0.2) {
      return "text-yellow-600 dark:text-yellow-500";
    }
    return "";
  };

  // Định nghĩa columns cho table
  const columns: ColumnDef<LeaveBalanceSummaryResponse>[] = [
    {
      id: "stt",
      header: "#",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {page * pageSize + row.index + 1}
        </span>
      ),
      size: 60,
    },
    {
      accessorKey: "employeeName",
      header: t("table.employee"),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.employeeName}</span>
      ),
    },
    {
      accessorKey: "employeeCode",
      header: t("table.employeeCode"),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.employeeCode}
        </span>
      ),
    },
    {
      id: "annual",
      header: () => (
        <div className="text-center">
          <div>{getEnumLabel("leaveType", "ANNUAL", tEnums)}</div>
          <div className="text-xs text-muted-foreground font-normal">
            ({t("table.balanceFormat")})
          </div>
        </div>
      ),
      cell: ({ row }) => (
        <div
          className={`text-center ${getBalanceColor(row.original, "ANNUAL")}`}
        >
          {getBalanceDisplay(row.original, "ANNUAL")}
        </div>
      ),
    },
    {
      id: "sick",
      header: () => (
        <div className="text-center">
          <div>{getEnumLabel("leaveType", "SICK", tEnums)}</div>
          <div className="text-xs text-muted-foreground font-normal">
            ({t("table.balanceFormat")})
          </div>
        </div>
      ),
      cell: ({ row }) => (
        <div className={`text-center ${getBalanceColor(row.original, "SICK")}`}>
          {getBalanceDisplay(row.original, "SICK")}
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(row.original);
            }}
            title={tCommon("edit")}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      ),
      size: 60,
    },
  ];

  return (
    <BaseTable
      columns={columns}
      data={data}
      showPagination={true}
      noResultsText={t("table.noData")}
      previousText={tCommon("previous")}
      nextText={tCommon("next")}
      serverPagination={{
        page,
        totalPages,
        totalElements,
        onPageChange,
      }}
    />
  );
}
