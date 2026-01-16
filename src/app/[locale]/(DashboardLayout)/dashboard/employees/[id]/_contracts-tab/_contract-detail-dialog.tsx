"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { EmploymentContract } from "@/types/attendance-records";
import { formatDate, formatDateTime } from "@/lib/utils/format-date";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { cn } from "@/lib/utils";

interface ContractDetailDialogProps {
  contract: EmploymentContract | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContractDetailDialog({
  contract,
  open,
  onOpenChange,
}: ContractDetailDialogProps) {
  const t = useTranslations("contracts");
  const tEnums = useTranslations("enums");

  if (!contract) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("detailTitle")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("detailTitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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

          {contract.daysUntilExpiry !== undefined &&
            contract.daysUntilExpiry > 0 && (
              <InfoRow
                label={t("daysUntilExpiry")}
                value={`${contract.daysUntilExpiry} ngày`}
              />
            )}

          {contract.terminationReason && (
            <InfoRow
              label={t("terminateReason")}
              value={contract.terminationReason}
            />
          )}

          {contract.terminatedAt && (
            <InfoRow
              label={t("terminatedAt")}
              value={formatDate(contract.terminatedAt)}
            />
          )}

          {contract.notes && (
            <InfoRow label={t("notes")} value={contract.notes} />
          )}

          {contract.createdAt && (
            <InfoRow
              label={t("createdAt") || "Ngày tạo"}
              value={formatDateTime(contract.createdAt)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}
