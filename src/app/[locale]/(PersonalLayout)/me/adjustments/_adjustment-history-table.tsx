"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { X, Loader2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Pagination } from "@/app/[locale]/_components/_base/_pagination";

import { adjustmentApi } from "@/lib/apis/adjustment-api";
import { formatDate, formatDateTime } from "@/lib/utils/format-date";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import type { AdjustmentRequest } from "@/types/attendance-records";
import type { SupportedLocale } from "@/lib/utils/format-currency";

const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 20;

/**
 * Component bảng lịch sử yêu cầu điều chỉnh chấm công
 */
export function AdjustmentHistoryTable() {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const tErrors = useTranslations("errors");
  const locale = useLocale() as SupportedLocale;

  const [adjustments, setAdjustments] = React.useState<AdjustmentRequest[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [page, setPage] = React.useState(DEFAULT_PAGE);
  const [totalPages, setTotalPages] = React.useState(0);
  const [cancelId, setCancelId] = React.useState<number | null>(null);
  const [isCancelling, setIsCancelling] = React.useState(false);

  // Fetch adjustments
  const fetchAdjustments = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adjustmentApi.getMyAdjustments(
        page,
        DEFAULT_LIMIT,
      );
      setAdjustments(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error fetching adjustments:", error);
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setIsLoading(false);
    }
  }, [page, tErrors]);

  React.useEffect(() => {
    fetchAdjustments();
  }, [fetchAdjustments]);

  // Handle cancel
  const handleCancel = async () => {
    if (!cancelId) return;

    try {
      setIsCancelling(true);
      await adjustmentApi.cancelMyAdjustment(cancelId);
      toast.success(t("messages.cancelSuccess"));
      setCancelId(null);
      fetchAdjustments();
    } catch (error) {
      const errorCode = (error as { errorCode?: string })?.errorCode;
      toast.error(getErrorMessage(errorCode, tErrors));
    } finally {
      setIsCancelling(false);
    }
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
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

  // Format adjustment name
  const formatAdjustmentName = (adj: AdjustmentRequest) => {
    const date = formatDate(adj.workDate, locale);
    return `${t("adjustment.title")} (${date})`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (adjustments.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t("messages.noAdjustments")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">{tCommon("status")}</TableHead>
              <TableHead>{t("adjustment.title")}</TableHead>
              <TableHead className="w-[150px]">
                {t("adjustment.approvedBy")}
              </TableHead>
              <TableHead className="w-[180px]">
                {t("adjustment.requestedAt")}
              </TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adjustments.map((adj) => (
              <TableRow key={adj.id}>
                <TableCell>
                  <Badge variant={getStatusVariant(adj.status)}>
                    {getEnumLabel("adjustmentStatus", adj.status, tEnums)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium text-primary hover:underline cursor-pointer">
                      {formatAdjustmentName(adj)}
                    </p>
                    {adj.reason && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {adj.reason}
                      </p>
                    )}
                    {adj.status === "REJECTED" && adj.rejectionReason && (
                      <p className="text-xs text-destructive">
                        {t("rejectionReason")}: {adj.rejectionReason}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>{adj.approverName || "-"}</TableCell>
                <TableCell>{formatDateTime(adj.createdAt, locale)}</TableCell>
                <TableCell>
                  {adj.status === "PENDING" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setCancelId(adj.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dialog.cancelTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialog.cancelDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {tCommon("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
