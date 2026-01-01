"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DepositRequestResponse } from "@/types/deposit";
import { DepositStatusBadge } from "@/app/[locale]/_components/_status-badge";
import { FallbackImage } from "@/app/[locale]/_components/_fallback-image";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { formatDateTime } from "@/lib/utils/format-date";
import { DepositStatus } from "@/types/enums";
import { Button } from "@/components/ui/button";
import { X, Pencil } from "lucide-react";
import { getFileUrl } from "@/lib/utils/file-url";

interface DepositColumnLabels {
  createdAt: string;
  amount: string;
  status: string;
  transferProof: string;
  rejectionReason: string;
  actions: string;
  cancel: string;
  edit: string;
}

interface DepositColumnCallbacks {
  onViewImage?: (imageUrl: string) => void;
  onCancel?: (deposit: DepositRequestResponse) => void;
  onEdit?: (deposit: DepositRequestResponse) => void;
}

/**
 * Tạo column definitions cho bảng yêu cầu nạp tiền
 * @param locale - Locale cho format tiền tệ và ngày tháng
 * @param labels - Labels cho các cột
 * @param callbacks - Callbacks cho các actions
 */
export function createDepositColumns(
  locale: SupportedLocale,
  labels: DepositColumnLabels,
  callbacks?: DepositColumnCallbacks,
): ColumnDef<DepositRequestResponse>[] {
  return [
    {
      accessorKey: "createdAt",
      header: labels.createdAt,
      cell: ({ row }) => formatDateTime(row.getValue("createdAt"), locale),
    },
    {
      accessorKey: "amount",
      header: labels.amount,
      cell: ({ row }) => (
        <span className="font-medium">
          {formatCurrency(row.getValue("amount"), locale)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: labels.status,
      cell: ({ row }) => <DepositStatusBadge status={row.getValue("status")} />,
    },
    {
      accessorKey: "transferProofUrl",
      header: labels.transferProof,
      cell: ({ row }) => {
        const imageUrl = row.getValue("transferProofUrl") as string;
        const fullUrl = getFileUrl(imageUrl);
        return (
          <FallbackImage
            src={fullUrl}
            alt="Transfer proof"
            className="h-10 w-10 rounded object-cover cursor-pointer hover:opacity-80"
            fallbackClassName="h-10 w-10 rounded"
            compact
            onClick={() => fullUrl && callbacks?.onViewImage?.(fullUrl)}
          />
        );
      },
    },
    {
      accessorKey: "rejectionReason",
      header: labels.rejectionReason,
      cell: ({ row }) => {
        const status = row.getValue("status") as DepositStatus;
        const reason = row.original.rejectionReason;
        if (status !== "REJECTED" || !reason) return "-";
        return <span className="text-destructive text-sm">{reason}</span>;
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const status = row.getValue("status") as DepositStatus;
        const deposit = row.original;

        // PENDING: hiển thị nút Hủy
        if (status === "PENDING" && callbacks?.onCancel) {
          return (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => callbacks.onCancel?.(deposit)}
            >
              <X className="h-4 w-4 mr-1" />
              {labels.cancel}
            </Button>
          );
        }

        // REJECTED: hiển thị nút Sửa
        if (status === "REJECTED" && callbacks?.onEdit) {
          return (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => callbacks.onEdit?.(deposit)}
            >
              <Pencil className="h-4 w-4 mr-1" />
              {labels.edit}
            </Button>
          );
        }

        return "-";
      },
    },
  ];
}
