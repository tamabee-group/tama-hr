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

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmationDialog } from "@/app/[locale]/_components/_base/confirmation-dialog";
import { shiftApi } from "@/lib/apis/shift-api";
import {
  formatDateWithDayOfWeek,
  formatDateTime,
} from "@/lib/utils/format-date";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import type { ShiftSwapRequest } from "@/types/attendance-records";
import type { SupportedLocale } from "@/lib/utils/format-currency";

interface SwapRequestHistoryProps {
  requests: ShiftSwapRequest[];
  onRefresh: () => void;
}

export function SwapRequestHistory({
  requests,
  onRefresh,
}: SwapRequestHistoryProps) {
  const t = useTranslations("shifts");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const locale = useLocale() as SupportedLocale;

  const [cancelingId, setCancelingId] = React.useState<number | null>(null);
  const [showCancelDialog, setShowCancelDialog] = React.useState(false);
  const [selectedRequest, setSelectedRequest] =
    React.useState<ShiftSwapRequest | null>(null);

  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const approvedRequests = requests.filter((r) => r.status === "APPROVED");
  const rejectedRequests = requests.filter((r) => r.status === "REJECTED");

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
    } catch (error) {
      console.error("Error canceling swap request:", error);
      toast.error(t("swapCancelError"));
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">
            {t("pendingRequests")} ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            {t("approvedRequests")} ({approvedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            {t("rejectedRequests")} ({rejectedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <RequestList
            requests={pendingRequests}
            locale={locale}
            t={t}
            tEnums={tEnums}
            onCancel={handleOpenCancelDialog}
            cancelingId={cancelingId}
            emptyMessage={t("noSwapHistory")}
          />
        </TabsContent>

        <TabsContent value="approved" className="mt-4">
          <RequestList
            requests={approvedRequests}
            locale={locale}
            t={t}
            tEnums={tEnums}
            emptyMessage={t("noSwapHistory")}
          />
        </TabsContent>

        <TabsContent value="rejected" className="mt-4">
          <RequestList
            requests={rejectedRequests}
            locale={locale}
            t={t}
            tEnums={tEnums}
            emptyMessage={t("noSwapHistory")}
          />
        </TabsContent>
      </Tabs>

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

interface RequestListProps {
  requests: ShiftSwapRequest[];
  locale: SupportedLocale;
  t: ReturnType<typeof useTranslations>;
  tEnums: ReturnType<typeof useTranslations>;
  onCancel?: (request: ShiftSwapRequest) => void;
  cancelingId?: number | null;
  emptyMessage: string;
}

function RequestList({
  requests,
  locale,
  t,
  tEnums,
  onCancel,
  cancelingId,
  emptyMessage,
}: RequestListProps) {
  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {emptyMessage}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <SwapRequestCard
          key={request.id}
          request={request}
          locale={locale}
          t={t}
          tEnums={tEnums}
          onCancel={onCancel}
          isCanceling={cancelingId === request.id}
        />
      ))}
    </div>
  );
}

interface SwapRequestCardProps {
  request: ShiftSwapRequest;
  locale: SupportedLocale;
  t: ReturnType<typeof useTranslations>;
  tEnums: ReturnType<typeof useTranslations>;
  onCancel?: (request: ShiftSwapRequest) => void;
  isCanceling?: boolean;
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

  return (
    <Card>
      <CardContent className="py-4">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{t("swapDetailTitle")}</span>
            </div>
            <StatusBadge status={request.status} tEnums={tEnums} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground mb-2">
                {t("yourShift")}
              </p>
              <ShiftInfo shift={request.requesterShift} locale={locale} />
            </div>
            <div className="p-3 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground mb-2">
                {t("targetShift")}
              </p>
              <ShiftInfo shift={request.targetShift} locale={locale} />
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{request.targetEmployeeName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {t("requestedAt")}: {formatDateTime(request.createdAt, locale)}
            </span>
            {isPending && onCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCancel(request)}
                disabled={isCanceling}
                className="text-destructive hover:text-destructive"
              >
                {isCanceling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-1" />
                    {t("cancelSwap")}
                  </>
                )}
              </Button>
            )}
          </div>

          {request.status === "REJECTED" && request.rejectionReason && (
            <div className="p-3 bg-destructive/10 rounded-md">
              <p className="text-sm text-destructive">
                <span className="font-medium">{t("rejectionReason")}:</span>{" "}
                {request.rejectionReason}
              </p>
            </div>
          )}

          {request.status === "APPROVED" && request.approverName && (
            <div className="text-sm text-muted-foreground">
              {t("approvedBy")}: {request.approverName} -{" "}
              {request.approvedAt && formatDateTime(request.approvedAt, locale)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ShiftInfoProps {
  shift: ShiftSwapRequest["requesterShift"];
  locale: SupportedLocale;
}

function ShiftInfo({ shift, locale }: ShiftInfoProps) {
  return (
    <div className="space-y-1 text-sm">
      <div className="font-medium">{shift.shiftName}</div>
      <div className="flex items-center gap-1 text-muted-foreground">
        <Calendar className="h-3 w-3" />
        <span>{formatDateWithDayOfWeek(shift.workDate, locale)}</span>
      </div>
      <div className="flex items-center gap-1 text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>
          {shift.shiftStartTime} - {shift.shiftEndTime}
        </span>
      </div>
    </div>
  );
}

interface StatusBadgeProps {
  status: string;
  tEnums: ReturnType<typeof useTranslations>;
}

function StatusBadge({ status, tEnums }: StatusBadgeProps) {
  const getVariant = (s: string) => {
    switch (s) {
      case "PENDING":
        return "secondary";
      case "APPROVED":
        return "default";
      case "REJECTED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getIcon = (s: string) => {
    switch (s) {
      case "PENDING":
        return <Loader2 className="h-3 w-3 mr-1 animate-spin" />;
      case "APPROVED":
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case "REJECTED":
        return <XCircle className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <Badge variant={getVariant(status)} className="flex items-center">
      {getIcon(status)}
      {getEnumLabel("swapRequestStatus", status, tEnums)}
    </Badge>
  );
}
