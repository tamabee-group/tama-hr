"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  User,
  CreditCard,
  Wallet,
  TrendingUp,
  Award,
  Calendar,
} from "lucide-react";
import { ReferredCompany } from "@/types/referral";
import { formatCurrency } from "@/lib/utils/format-currency";
import {
  COMMISSION_STATUS_LABELS,
  COMMISSION_STATUS_COLORS,
  CommissionStatus,
} from "@/types/enums";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface ReferralDetailDialogProps {
  company: ReferredCompany | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Dialog hiển thị chi tiết công ty đã giới thiệu
 * Bao gồm thông tin service usage và commission status
 * @client-only
 */
export function ReferralDetailDialog({
  company,
  open,
  onClose,
}: ReferralDetailDialogProps) {
  if (!company) return null;

  // Lấy className cho commission status badge
  const getCommissionBadgeClassName = (status: CommissionStatus): string => {
    const color = COMMISSION_STATUS_COLORS[status] || "warning";
    if (color === "warning") {
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200";
    }
    if (color === "info") {
      return "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200";
    }
    if (color === "success") {
      return "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200";
    }
    return "";
  };

  // Format ngày thanh toán hoa hồng
  const formatPaidDate = (dateStr?: string) => {
    if (!dateStr) return "Chưa thanh toán";
    try {
      return format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return dateStr;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Chi tiết công ty
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Thông tin công ty */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Thông tin công ty
            </h3>
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>Tên công ty</span>
                </div>
                <span className="font-medium">{company.companyName}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Chủ sở hữu</span>
                </div>
                <span className="font-medium">{company.ownerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  <span>Gói dịch vụ</span>
                </div>
                <Badge variant="outline">{company.planName}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>Trạng thái</span>
                </div>
                <Badge
                  variant="secondary"
                  className={
                    company.status === "ACTIVE"
                      ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200"
                      : ""
                  }
                >
                  {company.status === "ACTIVE"
                    ? "Hoạt động"
                    : "Không hoạt động"}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Thông tin tài chính */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Thông tin tài chính
            </h3>
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wallet className="h-4 w-4" />
                  <span>Số dư hiện tại</span>
                </div>
                <span className="font-medium text-green-600">
                  {formatCurrency(company.currentBalance, "vi")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>Tổng nạp tiền</span>
                </div>
                <span className="font-medium">
                  {formatCurrency(company.totalDeposits, "vi")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  <span>Tổng billing</span>
                </div>
                <span className="font-medium">
                  {formatCurrency(company.totalBilling, "vi")}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Thông tin hoa hồng */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Thông tin hoa hồng
            </h3>
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Award className="h-4 w-4" />
                  <span>Số tiền hoa hồng</span>
                </div>
                <span className="font-medium text-cyan-600">
                  {formatCurrency(company.commissionAmount, "vi")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>Trạng thái</span>
                </div>
                <Badge
                  variant="secondary"
                  className={getCommissionBadgeClassName(
                    company.commissionStatus,
                  )}
                >
                  {COMMISSION_STATUS_LABELS[company.commissionStatus]?.vi ||
                    company.commissionStatus}
                </Badge>
              </div>
              {company.commissionPaidAt && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Ngày thanh toán</span>
                  </div>
                  <span className="font-medium">
                    {formatPaidDate(company.commissionPaidAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
