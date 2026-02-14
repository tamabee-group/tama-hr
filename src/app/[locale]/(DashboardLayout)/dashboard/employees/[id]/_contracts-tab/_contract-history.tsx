"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmploymentContract } from "@/types/attendance-records";
import { formatDate } from "@/lib/utils/format-date-time";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { cn } from "@/lib/utils";
import { ContractDetailDialog } from "../../../contracts/_contract-detail-dialog";

interface ContractHistoryProps {
  employeeId: number;
  history: EmploymentContract[];
  onEdit: (contract: EmploymentContract) => void;
  onDeleted: () => void;
}

export function ContractHistory({ history, onDeleted }: ContractHistoryProps) {
  const t = useTranslations("contracts");
  const tEnums = useTranslations("enums");

  const [viewingContract, setViewingContract] =
    useState<EmploymentContract | null>(null);

  // Kiểm tra contract sắp hết hạn (trong 30 ngày)
  const isExpiringSoon = (contract: EmploymentContract): boolean => {
    if (contract.status !== "ACTIVE") return false;
    return (
      contract.daysUntilExpiry !== undefined && contract.daysUntilExpiry <= 30
    );
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("noContracts")}
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">#</TableHead>
            <TableHead>{t("table.contractNumber")}</TableHead>
            <TableHead>{t("table.type")}</TableHead>
            <TableHead>{t("table.period")}</TableHead>
            <TableHead>{t("table.status")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((contract, index) => {
            const expiring = isExpiringSoon(contract);
            return (
              <TableRow
                key={contract.id}
                onClick={() => setViewingContract(contract)}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">
                  {contract.contractNumber || "-"}
                </TableCell>
                <TableCell>
                  {getEnumLabel("contractType", contract.contractType, tEnums)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span>{formatDate(contract.startDate)}</span>
                    <span>
                      {contract.endDate ? formatDate(contract.endDate) : "∞"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        contract.status === "ACTIVE" &&
                          "border-green-500 text-green-600",
                        contract.status === "EXPIRED" &&
                          "border-gray-500 text-gray-600",
                        contract.status === "TERMINATED" &&
                          "border-red-500 text-red-600",
                      )}
                    >
                      {getEnumLabel("contractStatus", contract.status, tEnums)}
                    </Badge>
                    {expiring && (
                      <span
                        className="text-yellow-600"
                        title={t("expiringIn", {
                          days: contract.daysUntilExpiry ?? 0,
                        })}
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Detail Dialog */}
      <ContractDetailDialog
        contract={viewingContract}
        open={!!viewingContract}
        onClose={() => setViewingContract(null)}
        onSuccess={onDeleted}
      />
    </>
  );
}
