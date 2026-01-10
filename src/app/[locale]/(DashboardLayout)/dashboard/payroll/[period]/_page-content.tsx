"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, Download, FileText } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  payrollPeriodApi,
  PayrollPeriodSummary,
} from "@/lib/apis/payroll-period-api";
import { PayrollPeriod, PayrollItem } from "@/types/attendance-records";
import { PayrollPeriodStatus } from "@/types/attendance-enums";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/format-date";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { PayrollItemTable } from "./_payroll-item-table";
import { PayrollApprovalDialog } from "./_payroll-approval-dialog";

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
  const router = useRouter();

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

  // Handle recalculate
  const handleRecalculate = async () => {
    setActionLoading("recalculate");
    try {
      await payrollPeriodApi.recalculatePayroll(periodId);
      toast.success(t("recalculateSuccess"));
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setActionLoading(null);
    }
  };

  // Handle export CSV
  const handleExportCsv = async () => {
    setActionLoading("csv");
    try {
      const blob = await payrollPeriodApi.exportPayrollCsv(periodId);
      downloadBlob(blob, `payroll-${period?.year}-${period?.month}.csv`);
      toast.success(t("messages.exportSuccess"));
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setActionLoading(null);
    }
  };

  // Handle export PDF
  const handleExportPdf = async () => {
    setActionLoading("pdf");
    try {
      const blob = await payrollPeriodApi.exportPayrollPdf(periodId);
      downloadBlob(blob, `payroll-${period?.year}-${period?.month}.pdf`);
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
      {/* Back Button & Period Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {tCommon("back")}
          </Button>
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {t("period")}: {period.month}/{period.year}
            </span>
            <Badge variant={getStatusBadgeVariant(period.status)}>
              {getEnumLabel("payrollPeriodStatus", period.status, tEnums)}
            </Badge>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {formatDate(period.periodStart, locale)} -{" "}
          {formatDate(period.periodEnd, locale)}
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="py-2">
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("totalEmployees")}
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {summary.totalEmployees}
              </p>
            </CardContent>
          </Card>

          <Card className="py-2">
            <CardContent>
              <p className="text-sm text-muted-foreground">{t("totalGross")}</p>
              <p className="text-2xl font-bold">
                {formatCurrency(summary.totalGrossSalary)}
              </p>
            </CardContent>
          </Card>

          <Card className="py-2">
            <CardContent>
              <p className="text-sm text-muted-foreground">{t("totalNet")}</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalNetSalary)}
              </p>
            </CardContent>
          </Card>

          <Card className="py-2">
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("breakdown.totalOvertime")}
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(summary.totalOvertimePay)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Recalculate - only for DRAFT */}
        {period.status === "DRAFT" && (
          <Button
            variant="outline"
            onClick={handleRecalculate}
            disabled={actionLoading === "recalculate"}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("recalculate")}
          </Button>
        )}

        {/* Submit for Review - only for DRAFT */}
        {period.status === "DRAFT" && (
          <Button onClick={() => setApprovalAction("submit")}>
            {t("submitForReview")}
          </Button>
        )}

        {/* Approve - only for REVIEWING */}
        {period.status === "REVIEWING" && (
          <>
            <Button onClick={() => setApprovalAction("approve")}>
              {t("approve")}
            </Button>
            <Button
              variant="outline"
              onClick={() => setApprovalAction("reject")}
            >
              {tCommon("cancel")}
            </Button>
          </>
        )}

        {/* Mark as Paid - only for APPROVED */}
        {period.status === "APPROVED" && (
          <Button onClick={() => setApprovalAction("pay")}>
            {t("markAsPaid")}
          </Button>
        )}

        {/* Export buttons */}
        <Button
          variant="outline"
          onClick={handleExportCsv}
          disabled={actionLoading === "csv"}
        >
          <Download className="h-4 w-4 mr-2" />
          {t("actions.exportCsv")}
        </Button>

        <Button
          variant="outline"
          onClick={handleExportPdf}
          disabled={actionLoading === "pdf"}
        >
          <FileText className="h-4 w-4 mr-2" />
          {t("actions.exportPdf")}
        </Button>
      </div>

      {/* Locked Warning */}
      {isLocked && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            {t("lockedWarning")}
          </p>
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
