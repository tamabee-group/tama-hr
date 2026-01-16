"use client";

import { useTranslations } from "next-intl";
import { Edit, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmploymentContract } from "@/types/attendance-records";
import { formatDate } from "@/lib/utils/format-date";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { cn } from "@/lib/utils";

interface CurrentContractCardProps {
  contract: EmploymentContract;
  onEdit: (contract: EmploymentContract) => void;
}

export function CurrentContractCard({
  contract,
  onEdit,
}: CurrentContractCardProps) {
  const t = useTranslations("contracts");
  const tEnums = useTranslations("enums");

  // Tính số ngày còn lại
  const daysUntilExpiry = contract.daysUntilExpiry;
  const isExpiringSoon =
    daysUntilExpiry !== undefined &&
    daysUntilExpiry <= 30 &&
    daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry !== undefined && daysUntilExpiry <= 0;

  return (
    <div className="space-y-4">
      {/* Warning nếu sắp hết hạn */}
      {isExpiringSoon && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <span className="text-sm text-yellow-700 dark:text-yellow-300">
            {t("expiringIn", { days: daysUntilExpiry })}
          </span>
        </div>
      )}

      {isExpired && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <span className="text-sm text-red-700 dark:text-red-300">
            {t("expired")}
          </span>
        </div>
      )}

      {/* Contract info */}
      <div className="space-y-3">
        <InfoRow
          label={t("contractNumber")}
          value={contract.contractNumber || "-"}
        />
        <InfoRow
          label={t("contractType")}
          value={
            <Badge variant="outline">
              {getEnumLabel("contractType", contract.contractType, tEnums)}
            </Badge>
          }
        />
        <InfoRow
          label={t("startDate")}
          value={formatDate(contract.startDate)}
        />
        <InfoRow
          label={t("endDate")}
          value={contract.endDate ? formatDate(contract.endDate) : "-"}
        />
        <InfoRow
          label={t("table.status")}
          value={
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
          }
        />
        {daysUntilExpiry !== undefined && daysUntilExpiry > 0 && (
          <InfoRow
            label={t("daysUntilExpiry")}
            value={
              <span
                className={cn(
                  isExpiringSoon &&
                    "text-yellow-600 dark:text-yellow-400 font-medium",
                )}
              >
                {daysUntilExpiry} {t("days") || "ngày"}
              </span>
            }
          />
        )}
      </div>

      {/* Edit button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => onEdit(contract)}
      >
        <Edit className="h-4 w-4 mr-2" />
        {t("edit")}
      </Button>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
