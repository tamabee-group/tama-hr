"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Calendar,
  Clock,
  User,
  ArrowRightLeft,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "../../../_components/_glass-style/_glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/app/[locale]/_components/_base/confirmation-dialog";
import { shiftApi } from "@/lib/apis/shift-api";
import {
  formatDateWithDayOfWeek,
  formatDateTime,
} from "@/lib/utils/format-date-time";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { cn } from "@/lib/utils";
import type { ShiftSwapRequest } from "@/types/attendance-records";
import type { SupportedLocale } from "@/lib/utils/format-currency";

// ============================================
// Types
// ============================================

interface SwapHistoryProps {
  requests: ShiftSwapRequest[];
  onRefresh: () => void;
}

// ============================================
// Status Badge Colors
// ============================================

const statusBadgeVariants: Record<string, string> = {
  PENDING:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  APPROVED:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

// ============================================
// Component
// ============================================

export function SwapHistory({ requests, onRefresh }: SwapHistoryProps) {
  const t = useTranslations("portal.schedule");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const locale = useLocale() as SupportedLocale;

  const [cancelingId, setCancelingId] = React.useState<number | null>(null);
  const [showCancelDialog, setShowCancelDialog] = React.useState(false);
  const [selectedRequest, setSelectedRequest] =
    React.useState<ShiftSwapRequest | null>(null);

  // Handlers
  const handleOpenCancelDialog = (request: ShiftSwapRequest) => {
    setSelectedRequest(request);
    setShowCancelDialog(true);
  };

  const handleCancelRequest = async () => {
    if (!selectedRequest) return;
    try {
      setCancelingId(selectedRequest.id);
      await shiftApi.cancelSwapRequest(selectedRequest.id);
      toast.success(t("swapCancelSuccess"));
      setShowCancelDialog(false);
      onRefresh();
    } catch {
      toast.error(t("swapCancelError"));
    } finally {
      setCancelingId(null);
    }
  };

  // Không có yêu cầu đổi ca
  if (requests.length === 0) {
    return (
      <GlassCard className="p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
            <ArrowRightLeft className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t("noSwapHistory")}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t("noSwapHistoryDescription")}
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <SwapRequestCard
          key={request.id}
          request={request}
          locale={locale}
          t={t}
          tEnums={tEnums}
          onCancel={handleOpenCancelDialog}
          isCanceling={cancelingId === request.id}
        />
      ))}

      <ConfirmationDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title={t("cancelSwapTitle")}
        description={t("cancelSwapDescription")}
        confirmText={tCommon("confirm")}
        cancelText={tCommon("cancel")}
        variant="destructive"
        onConfirm={handleCancelRequest}
        isLoading={cancelingId !== null}
      />
    </div>
  );
}

// ============================================
// Swap Request Card Component
// ============================================

interface SwapRequestCardProps {
  request: ShiftSwapRequest;
  locale: SupportedLocale;
  t: ReturnType<typeof useTranslations>;
  tEnums: ReturnType<typeof useTranslations>;
  onCancel: (request: ShiftSwapRequest) => void;
  isCanceling: boolean;
}

function SwapRequestCard({
  request,
  locale,
  t,
  tEnums,
  onCancel,
  isCanceling,
}: SwapRequestCardProps) {
  const isPending = request.status === "PENDING";

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Loader2 className="h-3 w-3 animate-spin" />;
      case "APPROVED":
        return <CheckCircle className="h-3 w-3" />;
      case "REJECTED":
        return <XCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <GlassCard className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            <span className="font-medium text-gray-900 dark:text-white">
              {t("swapRequest")}
            </span>
          </div>
          <Badge
            className={cn(
              "flex items-center gap-1 border-0",
              statusBadgeVariants[request.status] ||
                statusBadgeVariants.PENDING,
            )}
          >
            {getStatusIcon(request.status)}
            {getEnumLabel("swapRequestStatus", request.status, tEnums)}
          </Badge>
        </div>

        {/* Shift Info Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Your Shift */}
          <div className="rounded-2xl bg-gray-50 p-3 dark:bg-white/5">
            <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              {t("yourShift")}
            </p>
            <ShiftInfo shift={request.requesterShift} locale={locale} />
          </div>

          {/* Target Shift */}
          <div className="rounded-2xl bg-gray-50 p-3 dark:bg-white/5">
            <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              {t("targetShift")}
            </p>
            <ShiftInfo shift={request.targetShift} locale={locale} />
            <div className="mt-2 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <User className="h-3 w-3" />
              <span>{request.targetEmployeeName}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>
            {t("requestedAt")}: {formatDateTime(request.createdAt, locale)}
          </span>
          {isPending && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancel(request)}
              disabled={isCanceling}
              className="text-red-600 hover:text-red-700 dark:text-red-400"
            >
              {isCanceling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="mr-1 h-4 w-4" />
                  {t("cancelSwap")}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Rejection Reason */}
        {request.status === "REJECTED" && request.rejectionReason && (
          <div className="rounded-2xl bg-red-50 p-3 dark:bg-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400">
              <span className="font-medium">{t("rejectionReason")}:</span>{" "}
              {request.rejectionReason}
            </p>
          </div>
        )}

        {/* Approval Info */}
        {request.status === "APPROVED" && request.approverName && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t("approvedBy")}: {request.approverName}
            {request.approvedAt &&
              ` - ${formatDateTime(request.approvedAt, locale)}`}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

// ============================================
// Shift Info Component
// ============================================

interface ShiftInfoProps {
  shift: ShiftSwapRequest["requesterShift"];
  locale: SupportedLocale;
}

function ShiftInfo({ shift, locale }: ShiftInfoProps) {
  return (
    <div className="space-y-1 text-sm">
      <div className="font-medium text-gray-900 dark:text-white">
        {shift.shiftName}
      </div>
      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
        <Calendar className="h-3 w-3" />
        <span>{formatDateWithDayOfWeek(shift.workDate, locale)}</span>
      </div>
      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
        <Clock className="h-3 w-3" />
        <span>
          {shift.shiftStartTime} - {shift.shiftEndTime}
        </span>
      </div>
    </div>
  );
}
