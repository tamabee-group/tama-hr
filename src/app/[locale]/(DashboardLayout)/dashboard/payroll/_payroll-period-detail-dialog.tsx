"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Calculator,
  Send,
  CheckCircle,
  XCircle,
  CreditCard,
  Eye,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { PayrollPeriod } from "@/types/attendance-records";
import { PayrollPeriodStatus } from "@/types/attendance-enums";
import { formatPayslip, SupportedLocale } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/format-date-time";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { payrollPeriodApi } from "@/lib/apis/payroll-period-api";
import { useAuth } from "@/hooks/use-auth";

interface PayrollPeriodDetailDialogProps {
  period: PayrollPeriod | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
}

// Map period status to badge variant
const getStatusBadgeVariant = (
  status: PayrollPeriodStatus,
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "PAID":
      return "default";
    case "APPROVED":
      return "secondary";
    case "REVIEWING":
      return "outline";
    case "DRAFT":
    default:
      return "outline";
  }
};

/**
 * Dialog chi tiết kỳ lương
 * Hiển thị thông tin kỳ lương và các action buttons theo status
 */
export function PayrollPeriodDetailDialog({
  period,
  open,
  onOpenChange,
  onRefresh,
}: PayrollPeriodDetailDialogProps) {
  const t = useTranslations("payroll");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const tEnums = useTranslations("enums");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const { user } = useAuth();
  const companyLocale = user?.locale || "vi";

  // State cho các action
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showCalculateConfirm, setShowCalculateConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showPayConfirm, setShowPayConfirm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRejectTemplate, setSelectedRejectTemplate] = useState("");

  if (!period) return null;

  // Xác định các action có thể thực hiện dựa trên status và role
  const isAdmin = user?.role === "ADMIN_COMPANY";
  const canCalculate = period.status === "DRAFT";
  const canSubmit = period.status === "DRAFT";
  const canApprove = period.status === "REVIEWING" && isAdmin;
  const canReject = period.status === "REVIEWING" && isAdmin;
  const canPay = period.status === "APPROVED" && isAdmin;
  const canDelete = period.status === "DRAFT";

  // Handle view detail page
  const handleViewDetail = () => {
    router.push(`/${locale}/dashboard/payroll/${period.id}`);
    onOpenChange(false);
  };

  // Handle calculate
  const handleCalculate = async () => {
    setLoading(true);
    try {
      await payrollPeriodApi.recalculatePayroll(period.id);
      toast.success(t("calculateSuccess"));
      onRefresh();
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoading(false);
    }
  };

  // Handle submit for review
  const handleSubmit = async () => {
    setLoading(true);
    try {
      await payrollPeriodApi.submitForReview(period.id);
      toast.success(t("submitSuccess"));
      onOpenChange(false);
      onRefresh();
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoading(false);
    }
  };

  // Handle approve
  const handleApprove = async () => {
    setLoading(true);
    try {
      await payrollPeriodApi.approvePayroll(period.id);
      toast.success(t("approveSuccess"));
      onOpenChange(false);
      onRefresh();
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoading(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error(t("rejectReasonRequired"));
      return;
    }
    setLoading(true);
    try {
      await payrollPeriodApi.rejectPayroll(period.id, rejectReason);
      toast.success(t("rejectSuccess"));
      setShowRejectDialog(false);
      setRejectReason("");
      onRefresh();
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoading(false);
    }
  };

  // Handle pay
  const handlePay = async () => {
    setLoading(true);
    try {
      await payrollPeriodApi.markAsPaid(period.id);
      toast.success(t("paySuccess"));
      onOpenChange(false);
      onRefresh();
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    setLoading(true);
    try {
      await payrollPeriodApi.deletePayrollPeriod(period.id);
      toast.success(t("periodDeleteSuccess"));
      setShowDeleteConfirm(false);
      onOpenChange(false);
      onRefresh();
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span>
                {t("period")}: {period.month}/{period.year}
              </span>
              <Badge variant={getStatusBadgeVariant(period.status)}>
                {getEnumLabel("payrollPeriodStatus", period.status, tEnums)}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-6">
            {/* Thông tin kỳ lương */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">
                  {t("periodStart")}
                </span>
                <p className="font-medium">
                  {formatDate(period.periodStart, locale)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">{t("periodEnd")}</span>
                <p className="font-medium">
                  {formatDate(period.periodEnd, locale)}
                </p>
              </div>
            </div>

            <Separator />

            {/* Lý do từ chối */}
            {period.rejectionReason && period.status === "DRAFT" && (
              <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                <p className="text-sm">
                  <span className="font-medium text-red-800 dark:text-red-200">
                    {t("rejectionReasonLabel")}:
                  </span>{" "}
                  <span className="text-red-700 dark:text-red-300">
                    {period.rejectionReason}
                  </span>
                </p>
              </div>
            )}

            {/* Thống kê */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("totalEmployees")}
                </span>
                <span className="font-medium text-blue-600">
                  {period.totalEmployees}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("totalGross")}</span>
                <span className="font-medium">
                  {formatPayslip(period.totalGrossSalary, companyLocale)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("totalNet")}</span>
                <span className="font-bold text-green-600">
                  {formatPayslip(period.totalNetSalary, companyLocale)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col gap-3 mt-6 sm:flex-col">
            <div className="flex flex-wrap items-center gap-2 w-full">
              {/* Nút Chi tiết - luôn hiển thị đầu tiên */}
              <Button variant="outline" size="sm" onClick={handleViewDetail}>
                <Eye className="h-4 w-4 mr-1.5" />
                {tCommon("details")}
              </Button>

              {/* DRAFT: Tính lương + Gửi duyệt */}
              {canCalculate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCalculateConfirm(true)}
                  disabled={loading}
                >
                  <Calculator className="h-4 w-4 mr-1.5" />
                  {t("calculate")}
                </Button>
              )}
              {canSubmit && (
                <Button
                  size="sm"
                  onClick={() => setShowSubmitConfirm(true)}
                  disabled={loading}
                >
                  <Send className="h-4 w-4 mr-1.5" />
                  {t("submit")}
                </Button>
              )}

              {/* REVIEWING: Duyệt + Từ chối */}
              {canApprove && (
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => setShowApproveConfirm(true)}
                  disabled={loading}
                >
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                  {t("approve")}
                </Button>
              )}
              {canReject && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive/50 hover:bg-destructive/10"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={loading}
                >
                  <XCircle className="h-4 w-4 mr-1.5" />
                  {t("reject")}
                </Button>
              )}

              {/* APPROVED: Đánh dấu đã trả */}
              {canPay && (
                <Button
                  size="sm"
                  onClick={() => setShowPayConfirm(true)}
                  disabled={loading}
                >
                  <CreditCard className="h-4 w-4 mr-1.5" />
                  {t("markAsPaid")}
                </Button>
              )}

              {/* Spacer để đẩy nút Xóa sang phải */}
              <div className="flex-1" />

              {/* Nút Xóa - luôn ở cuối bên phải */}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  {tCommon("delete")}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tCommon("delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmDeletePeriod")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? tCommon("loading") : tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Calculate Confirmation Dialog */}
      <AlertDialog
        open={showCalculateConfirm}
        onOpenChange={setShowCalculateConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("calculate")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmCalculate")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowCalculateConfirm(false);
                handleCalculate();
              }}
              disabled={loading}
            >
              {loading ? tCommon("loading") : tCommon("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("submit")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmSubmit")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowSubmitConfirm(false);
                handleSubmit();
              }}
              disabled={loading}
            >
              {loading ? tCommon("loading") : tCommon("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve Confirmation Dialog */}
      <AlertDialog
        open={showApproveConfirm}
        onOpenChange={setShowApproveConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("approve")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmApprove")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowApproveConfirm(false);
                handleApprove();
              }}
              disabled={loading}
            >
              {loading ? tCommon("loading") : tCommon("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Pay Confirmation Dialog */}
      <AlertDialog open={showPayConfirm} onOpenChange={setShowPayConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("markAsPaid")}</AlertDialogTitle>
            <AlertDialogDescription>{t("confirmPay")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowPayConfirm(false);
                handlePay();
              }}
              disabled={loading}
            >
              {loading ? tCommon("loading") : tCommon("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog - với template lý do */}
      <Dialog
        open={showRejectDialog}
        onOpenChange={(open) => {
          setShowRejectDialog(open);
          if (!open) {
            setSelectedRejectTemplate("");
            setRejectReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("rejectConfirmTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("rejectConfirmDesc")}
            </p>

            {/* Template lý do từ chối */}
            <div className="space-y-2">
              <Label>{t("rejectReason")}</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  "wrongData",
                  "missingEmployee",
                  "wrongCalculation",
                  "other",
                ].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedRejectTemplate(key);
                      if (key !== "other") {
                        setRejectReason(t(`rejectTemplates.${key}`));
                      } else {
                        setRejectReason("");
                      }
                    }}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      selectedRejectTemplate === key
                        ? "bg-destructive/10 border-destructive text-destructive"
                        : "border-border text-muted-foreground hover:border-foreground/50"
                    }`}
                  >
                    {t(`rejectTemplates.${key}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea - hiển thị khi chọn "Khác" hoặc muốn chỉnh sửa */}
            {selectedRejectTemplate === "other" && (
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t("rejectReasonPlaceholder")}
                rows={3}
              />
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setSelectedRejectTemplate("");
                setRejectReason("");
              }}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={loading || !rejectReason.trim()}
            >
              {loading ? tCommon("loading") : t("reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
