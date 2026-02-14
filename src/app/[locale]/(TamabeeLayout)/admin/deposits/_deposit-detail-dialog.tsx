"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageZoomDialog } from "@/app/[locale]/_components/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DepositRequestResponse } from "@/types/deposit";
import { DepositStatusBadge } from "@/app/[locale]/_components/_shared/display";
import { FallbackImage } from "@/app/[locale]/_components/image";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { depositApi } from "@/lib/apis/deposit-api";
import { getFileUrl } from "@/lib/utils/file-url";
import { handleApiError } from "@/lib/utils/api-error-handler";
import { formatDateTime } from "@/lib/utils/format-date-time";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { toast } from "sonner";
import { Check, X, Download, Loader2, ZoomIn } from "lucide-react";
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
  const tEnums = useTranslations("enums");

  const [isApproving, setIsApproving] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState(false);

  const handleImageLoadStatusChange = useCallback((loaded: boolean) => {
    setIsImageLoaded(loaded);
  }, []);

  const handleDownload = () => {
    if (!deposit?.transferProofUrl) return;
    const link = document.createElement("a");
    link.href = getFileUrl(deposit.transferProofUrl);
    link.download = `transfer-proof-${deposit.id}.webp`;
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
      handleApiError(error, { defaultMessage: t("messages.approveError") });
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
  const imageUrl = getFileUrl(deposit.transferProofUrl);

  return (
    <>
      <Dialog
        open={open && !showRejectForm && !showImageZoom}
        onOpenChange={handleClose}
      >
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("dialog.detailTitle")}</DialogTitle>
            <DialogDescription>
              {t("dialog.detailDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Cột trái: Thông tin */}
            <div className="space-y-4 md:bg-gray-50 md:p-4">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {t("dialog.companyInfo")}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <InfoItem
                    label={t("table.companyName")}
                    value={deposit.companyName}
                  />
                  <InfoItem
                    label={t("table.amount")}
                    value={formatCurrency(deposit.amount)}
                    valueClassName="text-lg font-bold text-primary"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {t("dialog.requesterInfo")}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InfoItem
                    label={t("table.requesterName")}
                    value={deposit.requesterName || deposit.requestedBy || "-"}
                  />
                  <InfoItem
                    label={t("table.requesterRole")}
                    value={
                      deposit.requesterRole
                        ? getEnumLabel(
                            "userRole",
                            deposit.requesterRole,
                            tEnums,
                          )
                        : "-"
                    }
                  />
                  <InfoItem
                    label={t("table.employeeCode")}
                    value={deposit.requestedBy || "-"}
                  />
                  <InfoItem
                    label={t("table.requesterEmail")}
                    value={deposit.requesterEmail || "-"}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {t("dialog.statusInfo")}
                </h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {t("table.status")}
                    </p>
                    <DepositStatusBadge status={deposit.status} />
                  </div>
                  <InfoItem
                    label={t("table.createdAt")}
                    value={formatDateTime(deposit.createdAt, locale)}
                  />
                  {deposit.processedAt && (
                    <InfoItem
                      label={t("table.processedAt")}
                      value={formatDateTime(deposit.processedAt, locale)}
                    />
                  )}
                </div>
                {deposit.rejectionReason && (
                  <div className="mt-2 p-3 bg-destructive/10 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">
                      {t("table.rejectionReason")}
                    </p>
                    <p className="text-sm text-destructive font-medium">
                      {deposit.rejectionReason}
                    </p>
                  </div>
                )}
              </div>

              {/* Thông tin người xử lý (chỉ hiển thị khi đã xử lý) */}
              {deposit.approvedBy && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      {t("dialog.approverInfo")}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <InfoItem
                        label={t("table.approverName")}
                        value={
                          deposit.approverName || deposit.approvedBy || "-"
                        }
                      />
                      <InfoItem
                        label={t("table.approverRole")}
                        value={
                          deposit.approverRole
                            ? getEnumLabel(
                                "userRole",
                                deposit.approverRole,
                                tEnums,
                              )
                            : "-"
                        }
                      />
                      <InfoItem
                        label={t("table.approverCode")}
                        value={deposit.approvedBy || "-"}
                      />
                      <InfoItem
                        label={t("table.approverEmail")}
                        value={deposit.approverEmail || "-"}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Cột phải: Ảnh chứng từ */}
            <div className="space-y-3 md:bg-gray-100 md:p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {t("table.transferProof")}
                </h4>
                {isImageLoaded && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="h-8 gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {t("actions.download")}
                  </Button>
                )}
              </div>
              <div
                className="relative flex items-center justify-center p-4 min-h-[300px] cursor-zoom-in group"
                onClick={() => isImageLoaded && setShowImageZoom(true)}
              >
                <FallbackImage
                  src={imageUrl}
                  alt={t("table.transferProof")}
                  className="max-w-full max-h-[400px] object-contain rounded-lg"
                  fallbackClassName="w-32 h-32 rounded-lg"
                  onLoadStatusChange={handleImageLoadStatusChange}
                />
                {isImageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center transition-colors rounded-lg">
                    <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-center md:justify-end gap-3 pt-4 mt-4">
            {showActions ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isApproving}
                >
                  {tCommon("cancel")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectForm(true)}
                  disabled={isApproving}
                >
                  <X className="h-4 w-4 mr-2" />
                  {t("actions.reject")}
                </Button>
                <Button onClick={handleApprove} disabled={isApproving}>
                  {isApproving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  {isApproving ? t("actions.approving") : t("actions.approve")}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={handleClose}>
                {tCommon("close")}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Zoom Dialog */}
      <ImageZoomDialog
        open={showImageZoom}
        onOpenChange={setShowImageZoom}
        src={imageUrl}
        alt={t("table.transferProof")}
      />

      {deposit && (
        <RejectForm
          open={showRejectForm}
          onOpenChange={setShowRejectForm}
          depositId={deposit.id}
          onSuccess={handleRejectSuccess}
          locale={locale}
          requesterLocale={deposit.requesterLanguage}
        />
      )}
    </>
  );
}

function InfoItem({
  label,
  value,
  valueClassName = "",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm font-medium ${valueClassName}`}>{value}</p>
    </div>
  );
}
