"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { CommissionResponse } from "@/types/commission";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatDateTime } from "@/lib/utils/format-date";
import { CommissionStatus } from "@/types/enums";
import { Badge } from "@/components/ui/badge";
import { getEnumLabel } from "@/lib/utils/get-enum-label";

interface CommissionPayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commission: CommissionResponse | null;
  onConfirm: () => Promise<void>;
}

/**
 * Component hiển thị trạng thái thanh toán
 */
function StatusBadge({
  status,
  tEnums,
}: {
  status: CommissionStatus;
  tEnums: ReturnType<typeof useTranslations<"enums">>;
}) {
  const label = getEnumLabel("commissionStatus", status, tEnums);

  if (status === "PAID") {
    return <Badge className="bg-green-100 text-green-800">{label}</Badge>;
  }

  if (status === "PENDING") {
    return <Badge className="bg-yellow-100 text-yellow-800">{label}</Badge>;
  }

  return <Badge className="bg-blue-100 text-blue-800">{label}</Badge>;
}

/**
 * Dialog xác nhận thanh toán hoa hồng
 * Hiển thị thông tin commission và billing của company
 */
export function CommissionPayDialog({
  open,
  onOpenChange,
  commission,
  onConfirm,
}: CommissionPayDialogProps) {
  const [loading, setLoading] = useState(false);
  const t = useTranslations("commissions");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const locale = useLocale() as "vi" | "en" | "ja";

  if (!commission) return null;

  const isEligible = commission.status === "ELIGIBLE";

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEligible ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            )}
            {t("payDialog.title")}
          </DialogTitle>
          <DialogDescription>{t("payDialog.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Thông tin nhân viên */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("payDialog.employee")}
              </p>
              <p className="font-medium">{commission.employeeName || "-"}</p>
              <p className="text-xs text-muted-foreground">
                {commission.employeeCode}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("payDialog.commissionAmount")}
              </p>
              <p className="font-medium text-lg text-primary">
                {formatCurrency(commission.amount, locale)}
              </p>
            </div>
          </div>

          {/* Thông tin company */}
          <div className="rounded-lg border p-4 space-y-3">
            <h4 className="font-medium">
              {t("payDialog.referredCompanyInfo")}
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">
                  {t("payDialog.companyName")}
                </p>
                <p className="font-medium">{commission.companyName || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{tCommon("status")}</p>
                <StatusBadge status={commission.status} tEnums={tEnums} />
              </div>
              <div>
                <p className="text-muted-foreground">
                  {t("payDialog.billingAtCreation")}
                </p>
                <p className="font-medium">
                  {formatCurrency(
                    commission.companyBillingAtCreation || 0,
                    locale,
                  )}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">
                  {t("payDialog.createdAt")}
                </p>
                <p className="font-medium">
                  {commission.createdAt
                    ? formatDateTime(commission.createdAt, locale)
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Cảnh báo nếu chưa đủ điều kiện */}
          {!isEligible && (
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">
                  {t("payDialog.notEligibleTitle")}
                </p>
                <p className="text-yellow-700">
                  {t("payDialog.notEligibleDescription")}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleConfirm} disabled={loading || !isEligible}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {tCommon("loading")}
              </>
            ) : (
              t("payDialog.confirmPayment")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
