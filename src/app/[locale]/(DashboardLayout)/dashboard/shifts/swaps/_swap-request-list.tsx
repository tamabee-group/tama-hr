"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Eye, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/app/[locale]/_components/_glass-style";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShiftSwapRequest } from "@/types/attendance-records";
import { getSwapRequests, processSwapRequest } from "@/lib/apis/shift-api";
import { formatDateWithDayOfWeek } from "@/lib/utils/format-date-time";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { ShiftSwapDetailDialog } from "./_shift-swap-detail-dialog";
import { SwapApprovalDialog } from "./_swap-approval-dialog";
import { ExplanationPanel } from "../../../../_components/_explanation-panel";
import type { SupportedLocale } from "@/lib/utils/format-currency";

const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 20;

/**
 * Component danh sách yêu cầu đổi ca
 */
export function SwapRequestList() {
  const t = useTranslations("shifts");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const locale = useLocale() as SupportedLocale;

  const [requests, setRequests] = useState<ShiftSwapRequest[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingRequest, setViewingRequest] = useState<ShiftSwapRequest | null>(
    null,
  );
  const [processingRequest, setProcessingRequest] =
    useState<ShiftSwapRequest | null>(null);
  const [processingAction, setProcessingAction] = useState<
    "approve" | "reject"
  >("approve");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch danh sách requests
  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getSwapRequests(page, DEFAULT_LIMIT);
      setRequests(response.content);
      setTotalElements(response.totalElements);
    } catch {
      toast.error(tCommon("errorLoading"));
    } finally {
      setIsLoading(false);
    }
  }, [page, tCommon]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Xử lý approve/reject
  const handleProcess = async (reason?: string) => {
    if (!processingRequest) return;
    try {
      setIsSubmitting(true);
      await processSwapRequest(processingRequest.id, {
        approved: processingAction === "approve",
        rejectionReason: reason,
      });
      toast.success(
        processingAction === "approve"
          ? t("swapApproveSuccess")
          : t("swapRejectSuccess"),
      );
      setProcessingRequest(null);
      fetchRequests();
    } catch {
      toast.error(
        processingAction === "approve"
          ? t("swapApproveError")
          : t("swapRejectError"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mở dialog approve
  const handleApprove = (request: ShiftSwapRequest) => {
    setProcessingRequest(request);
    setProcessingAction("approve");
  };

  // Mở dialog reject
  const handleReject = (request: ShiftSwapRequest) => {
    setProcessingRequest(request);
    setProcessingAction("reject");
  };

  // Format thời gian HH:mm
  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  // Tính tổng số trang
  const totalPages = Math.ceil(totalElements / DEFAULT_LIMIT);

  return (
    <>
      {/* Explanation Panel */}
      <ExplanationPanel
        title={t("explanations.swapsTitle")}
        description={t("explanations.swapsDesc")}
        tips={[t("explanations.swapsTip1"), t("explanations.swapsTip2")]}
        defaultCollapsed={true}
        className="mb-4"
      />

      <GlassCard className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-muted-foreground">
            {tCommon("total")}: {totalElements}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            {tCommon("loading")}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t("noSwaps")}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">#</TableHead>
                  <TableHead>{t("requester")}</TableHead>
                  <TableHead>{t("requesterShift")}</TableHead>
                  <TableHead>{t("targetEmployee")}</TableHead>
                  <TableHead>{t("targetShift")}</TableHead>
                  <TableHead>{t("table.status")}</TableHead>
                  <TableHead className="w-[140px]">
                    {tCommon("actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request, index) => (
                  <TableRow key={request.id}>
                    <TableCell>{page * DEFAULT_LIMIT + index + 1}</TableCell>
                    <TableCell className="font-medium">
                      {request.requesterName}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {request.requesterShift.shiftName}
                        <br />
                        <span className="text-muted-foreground">
                          {formatDateWithDayOfWeek(
                            request.requesterShift.workDate,
                            locale,
                          )}{" "}
                          {formatTime(
                            request.requesterShift.shiftStartTime || "",
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {request.targetEmployeeName}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {request.targetShift.shiftName}
                        <br />
                        <span className="text-muted-foreground">
                          {formatDateWithDayOfWeek(
                            request.targetShift.workDate,
                            locale,
                          )}{" "}
                          {formatTime(request.targetShift.shiftStartTime || "")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          request.status === "APPROVED"
                            ? "default"
                            : request.status === "REJECTED"
                              ? "destructive"
                              : "outline"
                        }
                      >
                        {getEnumLabel(
                          "swapRequestStatus",
                          request.status,
                          tEnums,
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewingRequest(request)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {request.status === "PENDING" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleApprove(request)}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleReject(request)}
                            >
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={page >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </GlassCard>

      {/* Detail Dialog */}
      <ShiftSwapDetailDialog
        open={!!viewingRequest}
        onOpenChange={(open: boolean) => !open && setViewingRequest(null)}
        swapRequest={viewingRequest}
        onApprove={() => viewingRequest && handleApprove(viewingRequest)}
        onReject={() => viewingRequest && handleReject(viewingRequest)}
      />

      {/* Approval Dialog */}
      <SwapApprovalDialog
        open={!!processingRequest}
        onOpenChange={(open: boolean) => !open && setProcessingRequest(null)}
        swapRequest={processingRequest}
        action={processingAction}
        onConfirm={handleProcess}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
