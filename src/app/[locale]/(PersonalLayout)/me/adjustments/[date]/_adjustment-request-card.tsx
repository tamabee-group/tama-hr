"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FileEdit, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatTime } from "@/lib/utils/format-date";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { adjustmentApi } from "@/lib/apis/adjustment-api";
import type { AdjustmentRequest } from "@/types/attendance-records";

interface AdjustmentRequestCardProps {
  requests: AdjustmentRequest[];
  onCancelSuccess?: () => void;
}

export function AdjustmentRequestCard({
  requests,
  onCancelSuccess,
}: AdjustmentRequestCardProps) {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const tErrors = useTranslations("errors");

  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<AdjustmentRequest | null>(null);

  const getStatusClassName = (status: string): string => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-300";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "";
    }
  };

  const handleCancelClick = (request: AdjustmentRequest) => {
    setSelectedRequest(request);
    setIsConfirmOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedRequest) return;

    try {
      setCancelingId(selectedRequest.id);
      await adjustmentApi.cancelMyAdjustment(selectedRequest.id);
      toast.success(t("adjustment.cancelSuccess"));
      onCancelSuccess?.();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setCancelingId(null);
      setIsConfirmOpen(false);
      setSelectedRequest(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileEdit className="h-4 w-4" />
            {t("adjustment.requestHistory")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="p-3 border rounded-lg space-y-2">
              {/* Status badge và nút thu hồi */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={getStatusClassName(request.status)}
                  >
                    {getEnumLabel("adjustmentStatus", request.status, tEnums)}
                  </Badge>
                  {request.assignedToName && (
                    <span className="text-xs text-muted-foreground">
                      → {request.assignedToName}
                    </span>
                  )}
                </div>
                {request.status === "PENDING" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleCancelClick(request)}
                    disabled={cancelingId === request.id}
                  >
                    {cancelingId === request.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        {t("adjustment.cancelRequest")}
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Requested times */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                {request.requestedCheckIn && (
                  <div>
                    <span className="text-muted-foreground">
                      {t("checkIn")}:{" "}
                    </span>
                    <span className="font-medium">
                      {formatTime(request.requestedCheckIn)}
                    </span>
                  </div>
                )}
                {request.requestedCheckOut && (
                  <div>
                    <span className="text-muted-foreground">
                      {t("checkOut")}:{" "}
                    </span>
                    <span className="font-medium">
                      {formatTime(request.requestedCheckOut)}
                    </span>
                  </div>
                )}
                {request.requestedBreakStart && (
                  <div>
                    <span className="text-muted-foreground">
                      {t("breakStart")}:{" "}
                    </span>
                    <span className="font-medium">
                      {formatTime(request.requestedBreakStart)}
                    </span>
                  </div>
                )}
                {request.requestedBreakEnd && (
                  <div>
                    <span className="text-muted-foreground">
                      {t("breakEnd")}:{" "}
                    </span>
                    <span className="font-medium">
                      {formatTime(request.requestedBreakEnd)}
                    </span>
                  </div>
                )}
              </div>

              {/* Reason */}
              <div className="text-sm">
                <span className="text-muted-foreground">
                  {t("adjustment.reason")}:{" "}
                </span>
                <span>{request.reason}</span>
              </div>

              {/* Rejection reason if rejected */}
              {request.status === "REJECTED" && request.rejectionReason && (
                <div className="text-sm text-destructive">
                  <span className="font-medium">
                    {t("adjustment.rejectionReason")}:{" "}
                  </span>
                  <span>{request.rejectionReason}</span>
                </div>
              )}

              {/* Approver comment if approved */}
              {request.status === "APPROVED" && request.approverComment && (
                <div className="text-sm text-green-600">
                  <span className="font-medium">
                    {t("adjustment.approverComment")}:{" "}
                  </span>
                  <span>{request.approverComment}</span>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Confirm dialog */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("adjustment.cancelRequest")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("adjustment.cancelConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("adjustment.cancelRequest")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
