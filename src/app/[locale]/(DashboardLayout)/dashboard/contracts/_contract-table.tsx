"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, AlertTriangle } from "lucide-react";
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

import { contractApi } from "@/lib/apis/contract-api";
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
import { ContractDetailDialog } from "./_contract-detail-dialog";
import { ContractFormDialog } from "./_contract-form-dialog";

const DEFAULT_LIMIT = 50;

/**
 * Component bảng danh sách hợp đồng lao động
 * Hiển thị contracts với status, highlighting cho contracts sắp hết hạn
 * Filter trên client-side để tránh gọi API nhiều lần
 */
export function ContractTable() {
  const t = useTranslations("contracts");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const tEnums = useTranslations("enums");
  const locale = useLocale() as SupportedLocale;

  // State
  const [allContracts, setAllContracts] = useState<EmploymentContract[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterEmployee, setFilterEmployee] = useState<string>("all");

  // Dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedContract, setSelectedContract] =
    useState<EmploymentContract | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedEmployeeIdForCreate, setSelectedEmployeeIdForCreate] =
    useState<number | null>(null);

  // Fetch contracts từ API
  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await contractApi.getContracts(0, DEFAULT_LIMIT, {});
      setAllContracts(data.content);
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoading(false);
    }
  }, [tErrors]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  // Lấy danh sách nhân viên unique từ contracts
  const employeeOptions = useMemo(() => {
    const uniqueEmployees = new Map<
      number,
      { id: number; code: string; name: string }
    >();
    allContracts.forEach((contract) => {
      if (contract.employeeId && !uniqueEmployees.has(contract.employeeId)) {
        uniqueEmployees.set(contract.employeeId, {
          id: contract.employeeId,
          code: contract.employeeCode || "",
          name: contract.employeeName || "",
        });
      }
    });
    return Array.from(uniqueEmployees.values()).sort((a, b) =>
      a.code.localeCompare(b.code),
    );
  }, [allContracts]);

  // Tìm current contract của employee được chọn (để tính startDate mặc định)
  const currentContractForSelectedEmployee = useMemo(() => {
    if (!selectedEmployeeIdForCreate) return null;
    return (
      allContracts.find(
        (c) =>
          c.employeeId === selectedEmployeeIdForCreate && c.status === "ACTIVE",
      ) || null
    );
  }, [allContracts, selectedEmployeeIdForCreate]);

  // Filter contracts trên client-side
  const filteredContracts = useMemo(() => {
    let filtered = [...allContracts];

    // Filter by employee
    if (filterEmployee !== "all") {
      filtered = filtered.filter(
        (c) => c.employeeId === Number(filterEmployee),
      );
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((c) => c.contractType === filterType);
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((c) => c.status === filterStatus);
    }

    // Sort theo employeeCode, sau đó contractNumber
    filtered.sort((a, b) => {
      const codeA = a.employeeCode || "";
      const codeB = b.employeeCode || "";
      if (codeA !== codeB) {
        return codeA.localeCompare(codeB);
      }
      return (a.contractNumber || "").localeCompare(b.contractNumber || "");
    });

    return filtered;
  }, [allContracts, filterEmployee, filterType, filterStatus]);

  // Handle view detail
  const handleViewDetail = (contract: EmploymentContract) => {
    setSelectedContract(contract);
    setShowDetailDialog(true);
  };

  // Handle create/edit success
  const handleSuccess = () => {
    setShowCreateDialog(false);
    setShowDetailDialog(false);
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
      cell: ({ row, table }) => {
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        return pageIndex * pageSize + row.index + 1;
      },
      size: 60,
    },
    {
      accessorKey: "employeeCode",
      header: t("table.employeeCode"),
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.employeeCode}</span>
      ),
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
        <div className="flex flex-col text-sm">
          <span>{formatDate(row.original.startDate, locale)}</span>
          <span>{formatDate(row.original.endDate, locale)}</span>
        </div>
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

          {/* Employee Filter */}
          <Select value={filterEmployee} onValueChange={setFilterEmployee}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t("selectEmployee")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tCommon("all")}</SelectItem>
              {employeeOptions.map((emp) => (
                <SelectItem key={emp.id} value={emp.id.toString()}>
                  {emp.code} - {emp.name}
                </SelectItem>
              ))}
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
          data={filteredContracts}
          showPagination={true}
          pageSize={DEFAULT_LIMIT}
          noResultsText={t("noContracts")}
          onRowClick={(contract) => handleViewDetail(contract)}
        />
      )}

      {/* Create Dialog */}
      <ContractFormDialog
        open={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false);
          setSelectedEmployeeIdForCreate(null);
        }}
        onSuccess={handleSuccess}
        availableEmployees={employeeOptions}
        currentContract={currentContractForSelectedEmployee}
        onEmployeeChange={setSelectedEmployeeIdForCreate}
      />

      {/* Detail Dialog */}
      <ContractDetailDialog
        open={showDetailDialog}
        onClose={() => {
          setShowDetailDialog(false);
          setSelectedContract(null);
        }}
        contract={selectedContract}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
