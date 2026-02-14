"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Check, X, Loader2 } from "lucide-react";

import { BackButton } from "@/app/[locale]/_components/_base/_back-button";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  GlassSection,
  GlassCard,
} from "@/app/[locale]/_components/_glass-style";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdjustmentStatusBadge } from "@/app/[locale]/_components/_shared/display/_status-badge";
import { TimeDisplay } from "@/app/[locale]/_components/_shared/display/_time-display";

import { AdjustmentRequest } from "@/types/attendance-records";
import {
  formatDateWithDayOfWeek,
  formatDateTime,
} from "@/lib/utils/format-date-time";
import type { SupportedLocale } from "@/lib/utils/format-currency";

interface AdjustmentDetailProps {
  request: AdjustmentRequest;
  onApprove: (comment?: string) => Promise<void>;
  onReject: (reason: string) => Promise<void>;
}

/**
 * Component hiển thị chi tiết yêu cầu điều chỉnh
 * So sánh thời gian gốc và thời gian yêu cầu
 * Hỗ trợ approve/reject với reason
 */
export function AdjustmentDetail({
  request,
  onApprove,
  onReject,
}: AdjustmentDetailProps) {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const locale = useLocale() as SupportedLocale;

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const isPending = request.status === "PENDING";

  // Handle approve
  const handleApproveConfirm = async () => {
    try {
      setIsProcessing(true);
      await onApprove(comment.trim() || undefined);
      setApproveDialogOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle reject
  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) return;

    try {
      setIsProcessing(true);
      await onReject(rejectReason.trim());
      setRejectDialogOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <BackButton />

      {/* Request Info Card */}
      <GlassSection
        title={t("adjustment.title")}
        headerAction={<AdjustmentStatusBadge status={request.status} />}
      >
        <div className="space-y-6">
          {/* Employee & Date Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("table.employee")}
              </p>
              <p className="font-medium">{request.employeeName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("adjustment.workDate")}
              </p>
              <p className="font-medium">
                {formatDateWithDayOfWeek(request.workDate, locale)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("adjustment.requestDate")}
              </p>
              <p className="font-medium">
                {formatDateTime(request.createdAt, locale)}
              </p>
            </div>
            {request.approverName && (
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("adjustment.approvedBy")}
                </p>
                <p className="font-medium">{request.approverName}</p>
              </div>
            )}
          </div>

          {/* Time Comparison */}
          <div>
            <h3 className="font-medium mb-4">{t("adjustment.comparison")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original Time */}
              <GlassCard className="p-4 bg-muted/50">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  {t("adjustment.original")}
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t("checkIn")}:</span>
                    <TimeDisplay time={request.originalCheckIn} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t("checkOut")}:</span>
                    <TimeDisplay time={request.originalCheckOut} />
                  </div>
                </div>
              </GlassCard>

              {/* Requested Time */}
              <GlassCard className="p-4 border-blue-200 bg-blue-50/50">
                <h4 className="text-sm font-medium text-blue-600 mb-3">
                  {t("adjustment.requested")}
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t("checkIn")}:</span>
                    <TimeDisplay
                      time={request.requestedCheckIn}
                      className="text-blue-600 font-medium"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t("checkOut")}:</span>
                    <TimeDisplay
                      time={request.requestedCheckOut}
                      className="text-blue-600 font-medium"
                    />
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Reason */}
          <div>
            <h3 className="font-medium mb-2">{t("adjustment.reason")}</h3>
            <p className="text-sm bg-muted p-3 rounded-md">{request.reason}</p>
          </div>

          {/* Rejection Reason (if rejected) */}
          {request.status === "REJECTED" && request.rejectionReason && (
            <div>
              <h3 className="font-medium mb-2 text-red-600">
                {t("adjustment.rejectionReason")}
              </h3>
              <p className="text-sm bg-red-50 p-3 rounded-md text-red-700">
                {request.rejectionReason}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {isPending && (
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setRejectDialogOpen(true)}
              >
                <X className="h-4 w-4 mr-2" />
                {t("adjustment.reject")}
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setApproveDialogOpen(true)}
              >
                <Check className="h-4 w-4 mr-2" />
                {t("adjustment.approve")}
              </Button>
            </div>
          )}
        </div>
      </GlassSection>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("adjustment.approve")}</DialogTitle>
            <DialogDescription>
              {t("adjustment.commentPlaceholder")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("adjustment.comment")}</Label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("adjustment.commentPlaceholder")}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApproveDialogOpen(false)}
              disabled={isProcessing}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleApproveConfirm}
              disabled={isProcessing}
            >
              {isProcessing && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {t("adjustment.approve")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("adjustment.reject")}</DialogTitle>
            <DialogDescription>
              {t("adjustment.rejectionReasonPlaceholder")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("adjustment.rejectionReason")}</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t("adjustment.rejectionReasonPlaceholder")}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={isProcessing}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={isProcessing || !rejectReason.trim()}
            >
              {isProcessing && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {t("adjustment.reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
