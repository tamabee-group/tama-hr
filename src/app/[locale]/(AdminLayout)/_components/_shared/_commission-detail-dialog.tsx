"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { CommissionResponse } from "@/types/commission";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatDateTime } from "@/lib/utils/format-date";
import { CommissionStatus } from "@/types/enums";
import { Badge } from "@/components/ui/badge";
import { User, Building2, Coins, CreditCard } from "lucide-react";

interface CommissionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commission: CommissionResponse | null;
}

/**
 * Component hiển thị trạng thái thanh toán
 */
function StatusBadge({ status }: { status: CommissionStatus }) {
  if (status === "PAID") {
    return <Badge className="bg-green-100 text-green-800">Đã thanh toán</Badge>;
  }

  if (status === "PENDING") {
    return (
      <Badge className="bg-yellow-100 text-yellow-800">Chờ đủ điều kiện</Badge>
    );
  }

  return <Badge className="bg-blue-100 text-blue-800">Chờ thanh toán</Badge>;
}

/**
 * Dialog hiển thị chi tiết hoa hồng
 */
export function CommissionDetailDialog({
  open,
  onOpenChange,
  commission,
}: CommissionDetailDialogProps) {
  if (!commission) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Chi tiết hoa hồng</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Section 1: Nhân viên nhận hoa hồng */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-semibold text-sm">Nhân viên nhận hoa hồng</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Tên nhân viên</p>
                <p className="font-medium">{commission.employeeName || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Mã nhân viên</p>
                <p className="font-medium">{commission.employeeCode}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Công ty được giới thiệu */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-semibold text-sm">Công ty được giới thiệu</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Tên công ty</p>
                <p className="font-medium">{commission.companyName || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">
                  Billing tại thời điểm tạo
                </p>
                <p className="font-medium">
                  {formatCurrency(
                    commission.companyBillingAtCreation || 0,
                    "vi",
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Thông tin hoa hồng */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-semibold text-sm">Thông tin hoa hồng</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Số tiền</p>
                <p className="font-semibold text-lg text-primary">
                  {formatCurrency(commission.amount, "vi")}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Trạng thái</p>
                <div className="mt-1">
                  <StatusBadge status={commission.status} />
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Ngày tạo</p>
                <p className="font-medium">
                  {commission.createdAt
                    ? formatDateTime(commission.createdAt, "vi")
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Thông tin thanh toán (chỉ hiển thị khi đã thanh toán) */}
          {commission.status === "PAID" && (
            <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-green-600" />
                <h4 className="font-semibold text-sm text-green-700 dark:text-green-400">
                  Thông tin thanh toán
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Người thanh toán</p>
                  <p className="font-medium">
                    {commission.paidByName || commission.paidBy || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ngày thanh toán</p>
                  <p className="font-medium">
                    {commission.paidAt
                      ? formatDateTime(commission.paidAt, "vi")
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
