"use client";

import { useTranslations, useLocale } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Calendar, FileText, User } from "lucide-react";
import { EmploymentContract } from "@/types/attendance-records";
import {
  CONTRACT_TYPE_COLORS,
  CONTRACT_STATUS_COLORS,
} from "@/types/attendance-enums";
import { formatDate } from "@/lib/utils/format-date";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { SupportedLocale } from "@/lib/utils/format-currency";

interface ContractDetailDialogProps {
  open: boolean;
  onClose: () => void;
  contract: EmploymentContract | null;
}

/**
 * Dialog hiển thị chi tiết hợp đồng lao động
 * Hiển thị đầy đủ thông tin: nhân viên, loại HĐ, thời hạn, trạng thái, ghi chú
 */
export function ContractDetailDialog({
  open,
  onClose,
  contract,
}: ContractDetailDialogProps) {
  const t = useTranslations("contracts");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const locale = useLocale() as SupportedLocale;

  if (!contract) return null;

  // Kiểm tra contract sắp hết hạn
  const isExpiringSoon =
    contract.status === "ACTIVE" &&
    contract.daysUntilExpiry !== undefined &&
    contract.daysUntilExpiry <= 30;

  // Tính số ngày còn lại
  const getDaysUntilExpiryText = () => {
    if (contract.daysUntilExpiry === undefined) return null;
    if (contract.daysUntilExpiry < 0) return t("expired");
    return t("expiringIn", { days: contract.daysUntilExpiry });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("detailTitle")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Expiring Warning */}
          {isExpiringSoon && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="text-sm text-yellow-700 dark:text-yellow-400">
                {getDaysUntilExpiryText()}
              </span>
            </div>
          )}

          {/* Contract Number & Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("contractNumber")}
              </p>
              <p className="text-lg font-semibold">{contract.contractNumber}</p>
            </div>
            <Badge
              variant={
                CONTRACT_STATUS_COLORS[contract.status] === "success"
                  ? "default"
                  : CONTRACT_STATUS_COLORS[contract.status] === "destructive"
                    ? "destructive"
                    : "secondary"
              }
            >
              {getEnumLabel("contractStatus", contract.status, tEnums)}
            </Badge>
          </div>

          <Separator />

          {/* Employee Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">{t("table.employee")}</span>
            </div>
            <p className="text-base">{contract.employeeName}</p>
          </div>

          {/* Contract Type */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{t("contractType")}</p>
            <Badge
              variant={
                CONTRACT_TYPE_COLORS[contract.contractType] === "info"
                  ? "default"
                  : "secondary"
              }
            >
              {getEnumLabel("contractType", contract.contractType, tEnums)}
            </Badge>
          </div>

          <Separator />

          {/* Period */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">{t("table.period")}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("startDate")}
                </p>
                <p className="font-medium">
                  {formatDate(contract.startDate, locale)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("endDate")}</p>
                <p className="font-medium">
                  {formatDate(contract.endDate, locale)}
                </p>
              </div>
            </div>
            {contract.daysUntilExpiry !== undefined &&
              contract.status === "ACTIVE" && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("daysUntilExpiry")}
                  </p>
                  <p
                    className={`font-medium ${
                      contract.daysUntilExpiry <= 30
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {contract.daysUntilExpiry} {tCommon("date")}
                  </p>
                </div>
              )}
          </div>

          {/* Termination Info (if terminated) */}
          {contract.status === "TERMINATED" && (
            <>
              <Separator />
              <div className="space-y-3">
                <p className="text-sm font-medium text-destructive">
                  {t("terminateTitle")}
                </p>
                {contract.terminatedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("terminatedAt")}
                    </p>
                    <p className="font-medium">
                      {formatDate(contract.terminatedAt, locale)}
                    </p>
                  </div>
                )}
                {contract.terminatorName && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("terminatedBy")}
                    </p>
                    <p className="font-medium">{contract.terminatorName}</p>
                  </div>
                )}
                {contract.terminationReason && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("terminateReason")}
                    </p>
                    <p className="text-sm">{contract.terminationReason}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Notes */}
          {contract.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{t("notes")}</p>
                <p className="text-sm whitespace-pre-wrap">{contract.notes}</p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            {tCommon("close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
