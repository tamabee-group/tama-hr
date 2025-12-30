"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DepositRequestResponse } from "@/types/deposit";
import { DepositStatusBadge } from "@/app/[locale]/_components/_status-badge";
import { FallbackImage } from "@/app/[locale]/_components/_fallback-image";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { formatDateTime } from "@/lib/utils/format-date";
import { DepositStatus } from "@/types/enums";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { getFileUrl } from "@/lib/utils/file-url";

interface DepositColumnLabels {
  createdAt: string;
  amount: string;
  status: string;
  transferProof: string;
  rejectionReason: string;
  viewImage: string;
}

/**
 * Tạo column definitions cho bảng yêu cầu nạp tiền
 * @param locale - Locale cho format tiền tệ và ngày tháng
 * @param labels - Labels cho các cột
 * @param onViewImage - Callback khi xem ảnh chứng minh
 */
export function createDepositColumns(
  locale: SupportedLocale,
  labels: DepositColumnLabels,
  onViewImage?: (imageUrl: string) => void,
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
          <div className="flex items-center gap-2">
            <FallbackImage
              src={fullUrl}
              alt="Transfer proof"
              className="h-10 w-10 rounded object-cover cursor-pointer hover:opacity-80"
              fallbackClassName="h-10 w-10 rounded"
              compact
              onClick={() => fullUrl && onViewImage?.(fullUrl)}
            />
            {fullUrl && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onViewImage?.(fullUrl)}
                title={labels.viewImage}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
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
  ];
}
