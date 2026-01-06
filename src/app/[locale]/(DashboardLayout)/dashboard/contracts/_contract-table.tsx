"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Plus, Trash2, AlertTriangle, XCircle } from "lucide-react";
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

import { contractApi, ContractFilters } from "@/lib/apis/contract-api";
import { EmploymentContract } from "@/types/attendance-records";
import {
  CONTRACT_TYPE_COLORS,
  CONTRACT_STATUS_COLORS,
} from "@/types/attendance-enums";
import { formatDate } from "@/lib/utils/format-date";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { SupportedLocale } from "@/lib/utils/format-currency";
import { ExpiringContractsBadge } from "./_expiring-contracts-badge";
import { ContractFormDialog } from "./_contract-form";
import { ContractDetailDialog } from "./_contract-detail-dialog";
import { TerminateContractDialog } from "./_terminate-contract-dialog";

const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 10;

/**
 * Component bảng danh sách hợp đồng lao động
 * Hiển thị contracts với status, highlighting cho contracts sắp hết hạn
 */
export function ContractTable() {
  const t = useTranslations("contracts");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const tEnums = useTranslations("enums");
  const locale = useLocale() as SupportedLocale;

  // State
  const [contracts, setContracts] = useState<EmploymentContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filter state
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedContract, setSelectedContract] =
    useState<EmploymentContract | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [terminateTarget, setTerminateTarget] =
    useState<EmploymentContract | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmploymentContract | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  // Fetch contracts
  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const filters: ContractFilters = {};
      if (filterType !== "all") filters.contractType = filterType;
      if (filterStatus !== "all") filters.status = filterStatus;

      const data = await contractApi.getContracts(page, DEFAULT_LIMIT, filters);
      setContracts(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoading(false);
    }
  }, [page, filterType, filterStatus, tErrors]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  // Handle view detail
  const handleViewDetail = (contract: EmploymentContract) => {
    setSelectedContract(contract);
    setShowDetailDialog(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await contractApi.deleteContract(deleteTarget.id);
      toast.success(t("deleteSuccess"));
      setDeleteTarget(null);
      fetchContracts();
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setDeleting(false);
    }
  };

  // Handle create/terminate success
  const handleSuccess = () => {
    setShowCreateDialog(false);
    setTerminateTarget(null);
    fetchContracts();
  };

  // Kiểm tra contract sắp hết hạn (trong 30 ngày)
  const isExpiringSoon = (contract: EmploymentContract): boolean => {
    if (contract.status !== "ACTIVE") return false;
    return (
      contract.daysUntilExpiry !== undefined && contract.daysUntilExpiry <= 30
    );
  };

  // Define columns
  const columns: ColumnDef<EmploymentContract>[] = [
    {
      id: "stt",
      header: "#",
      cell: ({ row }) => page * DEFAULT_LIMIT + row.index + 1,
      size: 60,
    },
    {
      accessorKey: "contractNumber",
      header: t("table.contractNumber"),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.contractNumber}</span>
      ),
    },
    {
      accessorKey: "employeeName",
      header: t("table.employee"),
      cell: ({ row }) => row.original.employeeName,
    },
    {
      accessorKey: "contractType",
      header: t("table.type"),
      cell: ({ row }) => (
        <Badge
          variant={
            CONTRACT_TYPE_COLORS[row.original.contractType] === "info"
              ? "default"
              : "secondary"
          }
        >
          {getEnumLabel("contractType", row.original.contractType, tEnums)}
        </Badge>
      ),
    },
    {
      accessorKey: "period",
      header: t("table.period"),
      cell: ({ row }) => (
        <span>
          {formatDate(row.original.startDate, locale)} -{" "}
          {formatDate(row.original.endDate, locale)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: t("table.status"),
      cell: ({ row }) => {
        const contract = row.original;
        const expiring = isExpiringSoon(contract);

        return (
          <div className="flex items-center gap-2">
            <Badge
              variant={
                CONTRACT_STATUS_COLORS[contract.status] === "success"
                  ? "default"
                  : CONTRACT_STATUS_COLORS[contract.status] === "destructive"
                    ? "destructive"
                    : "secondary"
              }
            >
              {getEnumLabel("contractStatus", contract.status, tEnums)}
            </Badge>
            {expiring && (
              <span
                className="text-yellow-600"
                title={t("expiringIn", { days: contract.daysUntilExpiry ?? 0 })}
              >
                <AlertTriangle className="h-4 w-4" />
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: tCommon("actions"),
      cell: ({ row }) => {
        const contract = row.original;
        const canDelete = contract.status === "ACTIVE";
        const canTerminate = contract.status === "ACTIVE";

        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewDetail(contract)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {canTerminate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTerminateTarget(contract)}
              >
                <XCircle className="h-4 w-4 text-orange-500" />
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteTarget(contract)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        );
      },
      size: 120,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Expiring Contracts Badge */}
      <ExpiringContractsBadge onViewContract={handleViewDetail} />

      {/* Filters & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Type Filter */}
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t("contractType")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tCommon("all")}</SelectItem>
              <SelectItem value="FULL_TIME">{t("typeFullTime")}</SelectItem>
              <SelectItem value="PART_TIME">{t("typePartTime")}</SelectItem>
              <SelectItem value="SEASONAL">{t("typeSeasonal")}</SelectItem>
              <SelectItem value="CONTRACT">{t("typeContract")}</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={tCommon("status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tCommon("all")}</SelectItem>
              <SelectItem value="ACTIVE">{t("statusActive")}</SelectItem>
              <SelectItem value="EXPIRED">{t("statusExpired")}</SelectItem>
              <SelectItem value="TERMINATED">
                {t("statusTerminated")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Create Button */}
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t("create")}
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
          data={contracts}
          showPagination={true}
          pageSize={DEFAULT_LIMIT}
          noResultsText={t("noContracts")}
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
      <ContractFormDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={handleSuccess}
      />

      {/* Detail Dialog */}
      <ContractDetailDialog
        open={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        contract={selectedContract}
      />

      {/* Terminate Dialog */}
      <TerminateContractDialog
        open={!!terminateTarget}
        onClose={() => setTerminateTarget(null)}
        contract={terminateTarget}
        onSuccess={handleSuccess}
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
              {t("deleteSuccess")}
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
