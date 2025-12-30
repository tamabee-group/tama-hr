"use client";

import { useState, useCallback } from "react";
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
import { toast } from "sonner";
import { Check, X, Download, Loader2 } from "lucide-react";
import { RejectForm } from "./_reject-form";

interface DepositDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deposit: DepositRequestResponse | null;
  onSuccess: () => void;
  locale?: SupportedLocale;
  canApproveReject?: boolean; // Cho phép approve/reject (ADMIN_TAMABEE, MANAGER_TAMABEE)
}

/**
 * Dialog hiển thị chi tiết yêu cầu nạp tiền
 * - Hiển thị ảnh chứng minh full size
 * - Thông tin chi tiết deposit
 * - Nút Duyệt/Từ chối (chỉ hiển thị khi status = PENDING)
 */
export function DepositDetailDialog({
  open,
  onOpenChange,
  deposit,
  onSuccess,
  locale = "vi",
  canApproveReject = true,
}: DepositDetailDialogProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleImageLoadStatusChange = useCallback((loaded: boolean) => {
    setIsImageLoaded(loaded);
  }, []);

  // Labels theo locale
  const labels = {
    vi: {
      title: "Chi tiết yêu cầu nạp tiền",
      description: "Xem thông tin chi tiết và duyệt yêu cầu",
      companyName: "Công ty",
      amount: "Số tiền",
      status: "Trạng thái",
      requestedBy: "Người yêu cầu",
      requesterName: "Tên người yêu cầu",
      requesterEmail: "Email người yêu cầu",
      employeeCode: "Mã nhân viên",
      createdAt: "Ngày tạo",
      processedAt: "Ngày xử lý",
      approvedBy: "Người duyệt",
      rejectionReason: "Lý do từ chối",
      transferProof: "Ảnh chứng minh chuyển khoản",
      download: "Tải xuống",
      approve: "Duyệt",
      reject: "Từ chối",
      close: "Đóng",
      approving: "Đang duyệt...",
      successApprove: "Duyệt yêu cầu thành công",
      errorApprove: "Không thể duyệt yêu cầu",
    },
    en: {
      title: "Deposit Request Detail",
      description: "View details and process request",
      companyName: "Company",
      amount: "Amount",
      status: "Status",
      requestedBy: "Requested By",
      requesterName: "Requester Name",
      requesterEmail: "Requester Email",
      employeeCode: "Employee Code",
      createdAt: "Created At",
      processedAt: "Processed At",
      approvedBy: "Approved By",
      rejectionReason: "Rejection Reason",
      transferProof: "Transfer Proof",
      download: "Download",
      approve: "Approve",
      reject: "Reject",
      close: "Close",
      approving: "Approving...",
      successApprove: "Request approved successfully",
      errorApprove: "Failed to approve request",
    },
    ja: {
      title: "入金リクエスト詳細",
      description: "詳細を確認してリクエストを処理",
      companyName: "会社",
      amount: "金額",
      status: "ステータス",
      requestedBy: "申請者",
      requesterName: "申請者名",
      requesterEmail: "申請者メール",
      employeeCode: "社員コード",
      createdAt: "作成日",
      processedAt: "処理日",
      approvedBy: "承認者",
      rejectionReason: "却下理由",
      transferProof: "振込証明",
      download: "ダウンロード",
      approve: "承認",
      reject: "却下",
      close: "閉じる",
      approving: "承認中...",
      successApprove: "リクエストが承認されました",
      errorApprove: "リクエストの承認に失敗しました",
    },
  };

  const t = labels[locale];

  // Format ngày theo locale
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(
        locale === "vi" ? "vi-VN" : locale === "ja" ? "ja-JP" : "en-US",
        {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        },
      );
    } catch {
      return dateString;
    }
  };

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
      toast.success(t.successApprove);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to approve deposit:", error);
      handleApiError(error, {
        forbiddenMessage: "Bạn không có quyền duyệt yêu cầu này",
        defaultMessage: t.errorApprove,
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
            <DialogTitle>{t.title}</DialogTitle>
            <DialogDescription>{t.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Detail Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t.companyName}</p>
                <p className="font-medium">{deposit.companyName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t.amount}</p>
                <p className="font-medium text-lg">
                  {formatCurrency(deposit.amount, locale)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t.status}</p>
                <DepositStatusBadge status={deposit.status} locale={locale} />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t.requesterName}
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
                  {t.requesterEmail}
                </p>
                <p className="font-medium">{deposit.requesterEmail || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t.employeeCode}
                </p>
                <p className="font-medium">{deposit.requestedBy || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t.createdAt}</p>
                <p className="font-medium">{formatDate(deposit.createdAt)}</p>
              </div>
              {deposit.processedAt && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t.processedAt}
                  </p>
                  <p className="font-medium">
                    {formatDate(deposit.processedAt)}
                  </p>
                </div>
              )}
              {deposit.approvedBy && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t.approvedBy}
                  </p>
                  <p className="font-medium">{deposit.approvedBy}</p>
                </div>
              )}
              {deposit.rejectionReason && (
                <div className="col-span-2 space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t.rejectionReason}
                  </p>
                  <p className="font-medium text-destructive">
                    {deposit.rejectionReason}
                  </p>
                </div>
              )}
            </div>

            {/* Transfer Proof Image */}
            <div className="space-y-3">
              <p className="text-sm font-medium">{t.transferProof}</p>
              <div className="flex items-center justify-center p-4 bg-muted rounded-lg min-h-[200px]">
                <FallbackImage
                  src={getFileUrl(deposit.transferProofUrl)}
                  alt={t.transferProof}
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
                    {t.download}
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
                  {t.reject}
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
                  {isApproving ? t.approving : t.approve}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={handleClose}>
                {t.close}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Form Dialog */}
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
