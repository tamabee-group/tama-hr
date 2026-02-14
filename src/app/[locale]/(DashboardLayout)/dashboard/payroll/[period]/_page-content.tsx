"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  RefreshCw,
  LockKeyhole,
  Download,
  Send,
  CheckCircle,
  XCircle,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import { BackButton } from "@/app/[locale]/_components/_base/_back-button";

import { GlassCard } from "@/app/[locale]/_components/_glass-style";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  payrollPeriodApi,
  PayrollPeriodSummary,
} from "@/lib/apis/payroll-period-api";
import { subscribeToNotificationEvents } from "@/hooks/use-notifications";
import { PayrollPeriod, PayrollItem } from "@/types/attendance-records";
import { PayrollPeriodStatus } from "@/types/attendance-enums";
import { formatPayslip, SupportedLocale } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/format-date-time";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { PayrollItemTable } from "./_payroll-item-table";
import { PayrollApprovalDialog } from "./_payroll-approval-dialog";
import { useAuth } from "@/hooks/use-auth";

interface PayrollPeriodDetailContentProps {
  periodId: number;
}

const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 50;

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
 * Component nội dung chi tiết kỳ lương
 * Hiển thị summary, workflow actions và payroll items
 */
export function PayrollPeriodDetailContent({
  periodId,
}: PayrollPeriodDetailContentProps) {
  const t = useTranslations("payroll");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const tEnums = useTranslations("enums");
  const locale = useLocale() as SupportedLocale;
  const { user } = useAuth();
  const companyLocale = user?.locale || "vi";

  // State
  const [period, setPeriod] = useState<PayrollPeriod | null>(null);
  const [summary, setSummary] = useState<PayrollPeriodSummary | null>(null);
  const [items, setItems] = useState<PayrollItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Dialog state
  const [approvalAction, setApprovalAction] = useState<
    "submit" | "approve" | "pay" | "reject" | null
  >(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [periodData, summaryData, itemsData] = await Promise.all([
        payrollPeriodApi.getPayrollPeriodById(periodId),
        payrollPeriodApi.getPayrollPeriodSummary(periodId),
        payrollPeriodApi.getPayrollItems(periodId, DEFAULT_PAGE, DEFAULT_LIMIT),
      ]);
      setPeriod(periodData);
      setSummary(summaryData);
      setItems(itemsData.content);
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoading(false);
    }
  }, [periodId, tErrors]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Subscribe real-time notification để auto-refresh
  useEffect(() => {
    const unsubscribe = subscribeToNotificationEvents("PAYROLL", () => {
      fetchData();
    });
    return unsubscribe;
  }, [fetchData]);

  // Kiểm tra quyền admin
  const isAdmin =
    user?.role === "ADMIN_COMPANY" || user?.role === "ADMIN_TAMABEE";

  // Handle recalculate
  const handleRecalculate = async () => {
    setActionLoading("recalculate");
    try {
      await payrollPeriodApi.recalculatePayroll(periodId);
      toast.success(t("messages.recalculateSuccess"));
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setActionLoading(null);
    }
  };

  // Handle export all payslips as ZIP
  const handleExportPdf = async () => {
    setActionLoading("pdf");
    try {
      const blob = await payrollPeriodApi.downloadAllPayslipsZip(periodId);
      downloadBlob(blob, `payslips_${period?.year}-${period?.month}.zip`);
      toast.success(t("messages.exportSuccess"));
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setActionLoading(null);
    }
  };

  // Handle workflow action success
  const handleActionSuccess = () => {
    setApprovalAction(null);
    fetchData();
  };

  // Check if period is locked (APPROVED or PAID)
  const isLocked = period?.status === "APPROVED" || period?.status === "PAID";

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-muted-foreground">{tCommon("loading")}</span>
      </div>
    );
  }

  if (!period) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-muted-foreground">{tCommon("noData")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <BackButton />

      {/* Period Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {period.month}/{period.year}
          </span>
          <Badge variant={getStatusBadgeVariant(period.status)}>
            {getEnumLabel("payrollPeriodStatus", period.status, tEnums)}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {formatDate(period.periodStart, locale)} -{" "}
          {formatDate(period.periodEnd, locale)}
        </div>
      </div>

      {/* Lý do từ chối */}
      {period.rejectionReason && period.status === "DRAFT" && (
        <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-red-800 dark:text-red-200">
              {t("rejectionReasonLabel")}
            </p>
            <p className="text-red-700 dark:text-red-300 mt-1">
              {period.rejectionReason}
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard className="p-4">
            <p className="text-sm text-muted-foreground">
              {t("summary.totalEmployees")}
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {summary.totalEmployees}
            </p>
          </GlassCard>

          <GlassCard className="p-4">
            <p className="text-sm text-muted-foreground">
              {t("summary.totalGross")}
            </p>
            <p className="text-2xl font-bold">
              {formatPayslip(summary.totalGrossSalary, companyLocale)}
            </p>
          </GlassCard>

          <GlassCard className="p-4">
            <p className="text-sm text-muted-foreground">
              {t("summary.totalNet")}
            </p>
            <p className="text-2xl font-bold text-green-600">
              {formatPayslip(summary.totalNetSalary, companyLocale)}
            </p>
          </GlassCard>

          <GlassCard className="p-4">
            <p className="text-sm text-muted-foreground">
              {t("summary.totalOvertime")}
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {formatPayslip(summary.totalOvertimePay, companyLocale)}
            </p>
          </GlassCard>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {/* DRAFT: Tính lại + Gửi duyệt */}
        {period.status === "DRAFT" && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRecalculate}
              disabled={actionLoading === "recalculate"}
            >
              <RefreshCw className="h-4 w-4 mr-1.5" />
              {t("actions.recalculate")}
            </Button>
            <Button size="sm" onClick={() => setApprovalAction("submit")}>
              <Send className="h-4 w-4 mr-1.5" />
              {t("actions.submitForReview")}
            </Button>
          </>
        )}

        {/* REVIEWING: Duyệt + Từ chối (chỉ admin) */}
        {period.status === "REVIEWING" && isAdmin && (
          <>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setApprovalAction("approve")}
            >
              <CheckCircle className="h-4 w-4 mr-1.5" />
              {t("actions.approve")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/50 hover:bg-destructive/10"
              onClick={() => setApprovalAction("reject")}
            >
              <XCircle className="h-4 w-4 mr-1.5" />
              {t("reject")}
            </Button>
          </>
        )}

        {/* APPROVED: Đánh dấu đã trả (chỉ admin) */}
        {period.status === "APPROVED" && isAdmin && (
          <Button size="sm" onClick={() => setApprovalAction("pay")}>
            <CreditCard className="h-4 w-4 mr-1.5" />
            {t("actions.markAsPaid")}
          </Button>
        )}
      </div>

      {/* Locked Warning */}
      {isLocked && (
        <div className="flex flex-col gap-2 md:flex-row md:justify-between bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
            <LockKeyhole size={18} />
            {t("messages.lockedWarning")}
          </p>
          <Button
            variant="outline"
            onClick={handleExportPdf}
            disabled={actionLoading === "pdf"}
          >
            <Download className="mr-1" />
            {t("actions.exportAll")}
          </Button>
        </div>
      )}

      {/* Payroll Items Table */}
      <PayrollItemTable
        periodId={periodId}
        items={items}
        periodStatus={period.status}
        onRefresh={fetchData}
      />

      {/* Approval Dialog */}
      {approvalAction && (
        <PayrollApprovalDialog
          open={!!approvalAction}
          onClose={() => setApprovalAction(null)}
          periodId={periodId}
          action={approvalAction}
          onSuccess={handleActionSuccess}
        />
      )}
    </div>
  );
}

/**
 * Helper function để download blob
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
