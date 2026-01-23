"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

import {
  payrollPeriodApi,
  PayrollPeriodFilters,
} from "@/lib/apis/payroll-period-api";
import { PayrollPeriod } from "@/types/attendance-records";
import { PayrollPeriodStatus } from "@/types/attendance-enums";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/format-date";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { PayrollPeriodFormDialog } from "./_payroll-period-form";

const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 10;

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
 * Component bảng danh sách kỳ lương
 * Hiển thị các kỳ lương với status và actions
 */
export function PayrollPeriodTable() {
  const t = useTranslations("payroll");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const tEnums = useTranslations("enums");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();

  // State
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filter state
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PayrollPeriod | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Tạo danh sách năm (5 năm gần nhất)
  const years = generateYears();

  // Fetch periods
  const fetchPeriods = useCallback(async () => {
    setLoading(true);
    try {
      const filters: PayrollPeriodFilters = {};
      if (filterYear !== "all") filters.year = parseInt(filterYear);
      if (filterStatus !== "all") filters.status = filterStatus;

      const data = await payrollPeriodApi.getPayrollPeriods(
        page,
        DEFAULT_LIMIT,
        filters,
      );
      setPeriods(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoading(false);
    }
  }, [page, filterYear, filterStatus, tErrors]);

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  // Handle view detail
  const handleViewDetail = (period: PayrollPeriod) => {
    router.push(`/${locale}/dashboard/payroll/${period.id}`);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await payrollPeriodApi.deletePayrollPeriod(deleteTarget.id);
      toast.success(t("periodDeleteSuccess"));
      setDeleteTarget(null);
      fetchPeriods();
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setDeleting(false);
    }
  };

  // Handle create success
  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
    fetchPeriods();
  };

  // Define columns
  const columns: ColumnDef<PayrollPeriod>[] = [
    {
      id: "stt",
      header: "#",
      cell: ({ row }) => page * DEFAULT_LIMIT + row.index + 1,
      size: 60,
    },
    {
      accessorKey: "period",
      header: t("period"),
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.month}/{row.original.year}
        </span>
      ),
    },
    {
      accessorKey: "periodStart",
      header: t("periodStart"),
      cell: ({ row }) => formatDate(row.original.periodStart, locale),
    },
    {
      accessorKey: "periodEnd",
      header: t("periodEnd"),
      cell: ({ row }) => formatDate(row.original.periodEnd, locale),
    },
    {
      accessorKey: "totalEmployees",
      header: t("totalEmployees"),
      cell: ({ row }) => (
        <span className="text-blue-600 font-medium">
          {row.original.totalEmployees}
        </span>
      ),
    },
    {
      accessorKey: "totalGrossSalary",
      header: t("totalGross"),
      cell: ({ row }) => formatCurrency(row.original.totalGrossSalary),
    },
    {
      accessorKey: "totalNetSalary",
      header: t("totalNet"),
      cell: ({ row }) => (
        <span className="font-bold text-green-600">
          {formatCurrency(row.original.totalNetSalary)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: tCommon("status"),
      cell: ({ row }) => (
        <Badge variant={getStatusBadgeVariant(row.original.status)}>
          {getEnumLabel("payrollPeriodStatus", row.original.status, tEnums)}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: tCommon("actions"),
      cell: ({ row }) => {
        const period = row.original;
        const canDelete = period.status === "DRAFT";

        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewDetail(period)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteTarget(period)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        );
      },
      size: 100,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Year Filter */}
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder={t("year")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tCommon("all")}</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={tCommon("status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tCommon("all")}</SelectItem>
              <SelectItem value="DRAFT">{t("statusDraft")}</SelectItem>
              <SelectItem value="REVIEWING">{t("statusReviewing")}</SelectItem>
              <SelectItem value="APPROVED">{t("statusApproved")}</SelectItem>
              <SelectItem value="PAID">{t("statusPaid")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Create Button */}
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t("createPeriod")}
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <span className="text-muted-foreground">{tCommon("loading")}</span>
        </div>
      ) : (
        <BaseTable
          columns={columns}
          data={periods}
          showPagination={true}
          pageSize={DEFAULT_LIMIT}
          noResultsText={tCommon("noData")}
        />
      )}

      {/* Pagination Info */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {tCommon("total")}: {totalElements}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              {tCommon("previous")}
            </Button>
            <span className="text-sm">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              {tCommon("next")}
            </Button>
          </div>
        </div>
      )}

      {/* Create Dialog */}
      <PayrollPeriodFormDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
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
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? tCommon("loading") : tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/**
 * Tạo danh sách 5 năm gần nhất
 */
function generateYears(): number[] {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => currentYear - i);
}
