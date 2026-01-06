"use client";

import { useTranslations, useLocale } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeftRight } from "lucide-react";
import { ShiftSwapRequest } from "@/types/attendance-records";
import { formatDate, formatDateTime } from "@/lib/utils/format-date";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import type { SupportedLocale } from "@/lib/utils/format-currency";

interface ShiftSwapDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  swapRequest: ShiftSwapRequest | null;
  onApprove: () => void;
  onReject: () => void;
}

/**
 * Dialog hiển thị chi tiết yêu cầu đổi ca
 * Bao gồm thông tin người yêu cầu, người đổi ca, và cả hai ca
 */
export function ShiftSwapDetailDialog({
  open,
  onOpenChange,
  swapRequest,
  onApprove,
  onReject,
}: ShiftSwapDetailDialogProps) {
  const t = useTranslations("shifts");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const locale = useLocale() as SupportedLocale;

  if (!swapRequest) return null;

  // Format thời gian HH:mm
  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const isPending = swapRequest.status === "PENDING";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {t("swapDetailTitle")}
            <Badge
              variant={
                swapRequest.status === "APPROVED"
                  ? "default"
                  : swapRequest.status === "REJECTED"
                    ? "destructive"
                    : "outline"
              }
            >
              {getEnumLabel("swapRequestStatus", swapRequest.status, tEnums)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Thông tin người yêu cầu và ca */}
          <div className="grid grid-cols-2 gap-6">
            {/* Người yêu cầu */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                {t("requester")}
              </h4>
              <div className="p-3 border rounded-lg space-y-2">
                <div className="font-medium">{swapRequest.requesterName}</div>
                <div className="text-sm text-muted-foreground">
                  {t("requesterShift")}:
                </div>
                <div className="text-sm">
                  <div className="font-medium">
                    {swapRequest.requesterShift.shiftName}
                  </div>
                  <div className="text-muted-foreground">
                    {formatDate(swapRequest.requesterShift.workDate, locale)}
                  </div>
                  <div className="text-muted-foreground">
                    {formatTime(
                      swapRequest.requesterShift.shiftStartTime || "",
                    )}{" "}
                    -{" "}
                    {formatTime(swapRequest.requesterShift.shiftEndTime || "")}
                  </div>
                </div>
              </div>
            </div>

            {/* Icon đổi ca */}
            <div className="flex items-center justify-center">
              <ArrowLeftRight className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>

          {/* Thông tin người đổi ca */}
          <div className="grid grid-cols-2 gap-6">
            <div className="col-start-2 space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                {t("targetEmployee")}
              </h4>
              <div className="p-3 border rounded-lg space-y-2">
                <div className="font-medium">
                  {swapRequest.targetEmployeeName}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("targetShift")}:
                </div>
                <div className="text-sm">
                  <div className="font-medium">
                    {swapRequest.targetShift.shiftName}
                  </div>
                  <div className="text-muted-foreground">
                    {formatDate(swapRequest.targetShift.workDate, locale)}
                  </div>
                  <div className="text-muted-foreground">
                    {formatTime(swapRequest.targetShift.shiftStartTime || "")} -{" "}
                    {formatTime(swapRequest.targetShift.shiftEndTime || "")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Thông tin duyệt */}
          {swapRequest.status !== "PENDING" && (
            <div className="space-y-2">
              {swapRequest.approverName && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("approvedBy")}
                  </span>
                  <span>{swapRequest.approverName}</span>
                </div>
              )}
              {swapRequest.approvedAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("approvedAt")}
                  </span>
                  <span>{formatDateTime(swapRequest.approvedAt, locale)}</span>
                </div>
              )}
              {swapRequest.rejectionReason && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("rejectionReason")}
                  </span>
                  <span className="text-destructive">
                    {swapRequest.rejectionReason}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Ngày tạo */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {tCommon("createdAt")}
            </span>
            <span>{formatDateTime(swapRequest.createdAt, locale)}</span>
          </div>
        </div>

        <DialogFooter>
          {isPending ? (
            <>
              <Button variant="outline" onClick={onReject}>
                {tCommon("cancel")}
              </Button>
              <Button onClick={onApprove}>{tCommon("confirm")}</Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {tCommon("close")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
