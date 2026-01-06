"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DepositRequestResponse } from "@/types/deposit";
import { DepositStatusBadge } from "@/app/[locale]/_components/_status-badge";
import { FallbackImage } from "@/app/[locale]/_components/_fallback-image";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { depositApi } from "@/lib/apis/deposit-api";
import { getFileUrl } from "@/lib/utils/file-url";
import { formatRequesterFullInfo } from "@/lib/utils/format-requester";
import { handleApiError } from "@/lib/utils/api-error-handler";
import { formatDateTime } from "@/lib/utils/format-date";
import { toast } from "sonner";
import { Check, X, Download, Loader2 } from "lucide-react";
import { RejectForm } from "./_reject-form";

interface DepositDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deposit: DepositRequestResponse | null;
  onSuccess: () => void;
  locale?: SupportedLocale;
  canApproveReject?: boolean;
}

export function DepositDetailDialog({
  open,
  onOpenChange,
  deposit,
  onSuccess,
  locale = "vi",
  canApproveReject = true,
}: DepositDetailDialogProps) {
  const t = useTranslations("deposits");
  const tCommon = useTranslations("common");

  const [isApproving, setIsApproving] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleImageLoadStatusChange = useCallback((loaded: boolean) => {
    setIsImageLoaded(loaded);
  }, []);

  const handleDownload = () => {
    if (!deposit?.transferProofUrl) return;

    const link = document.createElement("a");
    link.href = deposit.transferProofUrl;
    link.download = `transfer-proof-${deposit.id}-${Date.now()}.jpg`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApprove = async () => {
    if (!deposit) return;

    setIsApproving(true);
    try {
      await depositApi.approve(deposit.id);
      toast.success(t("messages.approveSuccess"));
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to approve deposit:", error);
      handleApiError(error, {
        defaultMessage: t("messages.approveError"),
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectSuccess = () => {
    setShowRejectForm(false);
    onOpenChange(false);
    onSuccess();
  };

  const handleClose = () => {
    if (!isApproving) {
      setShowRejectForm(false);
      onOpenChange(false);
    }
  };

  if (!deposit) return null;

  const isPending = deposit.status === "PENDING";
  const showActions = canApproveReject && isPending;

  return (
    <>
      <Dialog open={open && !showRejectForm} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("dialog.detailTitle")}</DialogTitle>
            <DialogDescription>
              {t("dialog.detailDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("table.companyName")}
                </p>
                <p className="font-medium">{deposit.companyName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("table.amount")}
                </p>
                <p className="font-medium text-lg">
                  {formatCurrency(deposit.amount, locale)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("table.status")}
                </p>
                <DepositStatusBadge status={deposit.status} />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("table.requesterName")}
                </p>
                <p className="font-medium">
                  {
                    formatRequesterFullInfo(
                      {
                        requestedBy: deposit.requestedBy,
                        requesterName: deposit.requesterName,
                        requesterEmail: deposit.requesterEmail,
                      },
                      locale,
                    ).displayName
                  }
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("table.requesterEmail")}
                </p>
                <p className="font-medium">{deposit.requesterEmail || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("table.employeeCode")}
                </p>
                <p className="font-medium">{deposit.requestedBy || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("table.createdAt")}
                </p>
                <p className="font-medium">
                  {formatDateTime(deposit.createdAt, locale)}
                </p>
              </div>
              {deposit.processedAt && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("table.processedAt")}
                  </p>
                  <p className="font-medium">
                    {formatDateTime(deposit.processedAt, locale)}
                  </p>
                </div>
              )}
              {deposit.approvedBy && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("table.approvedBy")}
                  </p>
                  <p className="font-medium">{deposit.approvedBy}</p>
                </div>
              )}
              {deposit.rejectionReason && (
                <div className="col-span-2 space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("table.rejectionReason")}
                  </p>
                  <p className="font-medium text-destructive">
                    {deposit.rejectionReason}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">{t("table.transferProof")}</p>
              <div className="flex items-center justify-center p-4 bg-muted rounded-lg min-h-[200px]">
                <FallbackImage
                  src={getFileUrl(deposit.transferProofUrl)}
                  alt={t("table.transferProof")}
                  className="max-w-full max-h-[50vh] object-contain rounded-lg"
                  fallbackClassName="w-32 h-32 rounded-lg"
                  onLoadStatusChange={handleImageLoadStatusChange}
                />
              </div>
              {isImageLoaded && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {t("actions.download")}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {showActions ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowRejectForm(true)}
                  disabled={isApproving}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  {t("actions.reject")}
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="gap-2"
                >
                  {isApproving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {isApproving ? t("actions.approving") : t("actions.approve")}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={handleClose}>
                {tCommon("close")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {deposit && (
        <RejectForm
          open={showRejectForm}
          onOpenChange={setShowRejectForm}
          depositId={deposit.id}
          onSuccess={handleRejectSuccess}
          locale={locale}
        />
      )}
    </>
  );
}
