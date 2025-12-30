"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CommissionResponse } from "@/types/commission";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { formatDateTime } from "@/lib/utils/format-date";
import { CommissionStatus } from "@/types/enums";
import { Badge } from "@/components/ui/badge";
import { User, Building2, Coins, CreditCard } from "lucide-react";
import { getCommissionStatusLabel } from "@/lib/utils/get-enum-label";

interface CommissionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commission: CommissionResponse | null;
}

/**
 * Component hiển thị trạng thái thanh toán
 */
interface StatusBadgeProps {
  status: CommissionStatus;
  tEnums: (key: string) => string;
}

function StatusBadge({ status, tEnums }: StatusBadgeProps) {
  const label = getCommissionStatusLabel(status, tEnums);

  if (status === "PAID") {
    return <Badge className="bg-green-100 text-green-800">{label}</Badge>;
  }

  if (status === "PENDING") {
    return <Badge className="bg-yellow-100 text-yellow-800">{label}</Badge>;
  }

  return <Badge className="bg-blue-100 text-blue-800">{label}</Badge>;
}

/**
 * Dialog hiển thị chi tiết hoa hồng
 */
export function CommissionDetailDialog({
  open,
  onOpenChange,
  commission,
}: CommissionDetailDialogProps) {
  const t = useTranslations("commissions");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const locale = useLocale() as SupportedLocale;

  if (!commission) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("detailDialog.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Section 1: Nhân viên nhận hoa hồng */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-semibold text-sm">
                {t("detailDialog.employeeSection")}
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">
                  {t("detailDialog.employeeName")}
                </p>
                <p className="font-medium">{commission.employeeName || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">
                  {t("detailDialog.employeeCode")}
                </p>
                <p className="font-medium">{commission.employeeCode}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Công ty được giới thiệu */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-semibold text-sm">
                {t("detailDialog.companySection")}
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">
                  {t("detailDialog.companyName")}
                </p>
                <p className="font-medium">{commission.companyName || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">
                  {t("detailDialog.billingAtCreation")}
                </p>
                <p className="font-medium">
                  {formatCurrency(
                    commission.companyBillingAtCreation || 0,
                    locale,
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Thông tin hoa hồng */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-semibold text-sm">
                {t("detailDialog.commissionSection")}
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">{tCommon("amount")}</p>
                <p className="font-semibold text-lg text-primary">
                  {formatCurrency(commission.amount, locale)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">{tCommon("status")}</p>
                <div className="mt-1">
                  <StatusBadge status={commission.status} tEnums={tEnums} />
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">{tCommon("createdAt")}</p>
                <p className="font-medium">
                  {commission.createdAt
                    ? formatDateTime(commission.createdAt, locale)
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
                  {t("detailDialog.paymentSection")}
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">
                    {t("detailDialog.paidBy")}
                  </p>
                  <p className="font-medium">
                    {commission.paidByName || commission.paidBy || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">
                    {t("detailDialog.paidAt")}
                  </p>
                  <p className="font-medium">
                    {commission.paidAt
                      ? formatDateTime(commission.paidAt, locale)
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
