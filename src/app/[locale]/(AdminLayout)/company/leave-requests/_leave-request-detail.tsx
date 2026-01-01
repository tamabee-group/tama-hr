"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Check, X, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import {
  LeaveStatusBadge,
  LeaveTypeBadge,
} from "@/app/[locale]/_components/_shared/_status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { RejectLeaveDialog } from "./_reject-leave-dialog";
import { leaveApi } from "@/lib/apis/leave-api";
import { LeaveRequest, LeaveBalance } from "@/types/attendance-records";
import { formatDate, formatDateTime } from "@/lib/utils/format-date";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import type { SupportedLocale } from "@/lib/utils/format-currency";

interface LeaveRequestDetailProps {
  requestId: number;
}

/**
 * Component chi tiết yêu cầu nghỉ phép
 * Hiển thị thông tin và cho phép approve/reject
 */
export function LeaveRequestDetail({ requestId }: LeaveRequestDetailProps) {
  const t = useTranslations("leave");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();

  // State
  const [request, setRequest] = useState<LeaveRequest | null>(null);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  // Fetch request detail
  const fetchRequest = useCallback(async () => {
    setLoading(true);
    try {
      const data = await leaveApi.getLeaveRequestById(requestId);
      setRequest(data);

      // Fetch leave balance for the employee
      const balance = await leaveApi.getEmployeeLeaveBalance(data.employeeId);
      setLeaveBalance(balance);
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoading(false);
    }
  }, [requestId, tErrors]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  // Handle approve
  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      await leaveApi.approveLeave(requestId);
      toast.success(t("messages.approveSuccess"));
      fetchRequest();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle reject confirm
  const handleRejectConfirm = async (reason: string) => {
    try {
      setIsProcessing(true);
      await leaveApi.rejectLeave(requestId, { reason });
      toast.success(t("messages.rejectSuccess"));
      setRejectDialogOpen(false);
      fetchRequest();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle back
  const handleBack = () => {
    router.push(`/${locale}/company/leave-requests`);
  };

  // Get balance for current leave type
  const currentBalance = request
    ? leaveBalance.find((b) => b.leaveType === request.leaveType)
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-muted-foreground">{tCommon("loading")}</span>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-muted-foreground">{tCommon("noData")}</span>
      </div>
    );
  }

  const isPending = request.status === "PENDING";

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={handleBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        {tCommon("back")}
      </Button>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Request Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t("title")}</span>
              <LeaveStatusBadge status={request.status} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("table.employee")}
                </p>
                <p className="font-medium">{request.employeeName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("table.type")}
                </p>
                <LeaveTypeBadge type={request.leaveType} />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("table.startDate")}
                </p>
                <p className="font-medium">
                  {formatDate(request.startDate, locale)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("table.endDate")}
                </p>
                <p className="font-medium">
                  {formatDate(request.endDate, locale)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">{t("table.days")}</p>
              <p className="font-medium text-lg">{request.totalDays}</p>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground">
                {t("table.reason")}
              </p>
              <p className="mt-1">{request.reason}</p>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground">
                {tCommon("createdAt")}
              </p>
              <p className="font-medium">
                {formatDateTime(request.createdAt, locale)}
              </p>
            </div>

            {request.approverName && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("table.approvedBy")}
                    </p>
                    <p className="font-medium">{request.approverName}</p>
                  </div>
                  {request.approvedAt && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t("table.approvedAt")}
                      </p>
                      <p className="font-medium">
                        {formatDateTime(request.approvedAt, locale)}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {request.rejectionReason && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-destructive">
                    {t("status.rejected")}
                  </p>
                  <p className="mt-1">{request.rejectionReason}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Leave Balance */}
        <Card>
          <CardHeader>
            <CardTitle>{t("leaveBalance")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentBalance ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("balance.total")}
                  </p>
                  <p className="font-medium text-lg">
                    {currentBalance.totalDays}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("balance.used")}
                  </p>
                  <p className="font-medium text-lg">
                    {currentBalance.usedDays}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("balance.remaining")}
                  </p>
                  <p className="font-medium text-lg text-green-600">
                    {currentBalance.remainingDays}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("balance.pending")}
                  </p>
                  <p className="font-medium text-lg text-yellow-600">
                    {currentBalance.pendingDays}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">{tCommon("noData")}</p>
            )}

            {/* All balances */}
            {leaveBalance.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t("balance.title")}</p>
                  {leaveBalance.map((balance) => (
                    <div
                      key={balance.leaveType}
                      className="flex items-center justify-between text-sm"
                    >
                      <LeaveTypeBadge type={balance.leaveType} />
                      <span>
                        {balance.remainingDays} / {balance.totalDays}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      {isPending && (
        <div className="flex items-center gap-4">
          <Button
            onClick={handleApprove}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            {t("messages.approveSuccess").replace("Đã duyệt ", "")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => setRejectDialogOpen(true)}
            disabled={isProcessing}
          >
            <X className="h-4 w-4 mr-2" />
            {t("messages.rejectSuccess").replace("Đã từ chối ", "")}
          </Button>
        </div>
      )}

      {/* Reject Dialog */}
      <RejectLeaveDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onConfirm={handleRejectConfirm}
        isProcessing={isProcessing}
      />
    </div>
  );
}
