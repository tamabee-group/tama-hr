"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { FileText, Calendar, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  PortalContractResponse,
  getContractStatusColor,
} from "@/types/employee-portal";
import { formatDate } from "@/lib/utils/format-date-time";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================

interface ContractDetailDialogProps {
  contract: PortalContractResponse | null;
  open: boolean;
  onClose: () => void;
}

// ============================================
// Status Badge Colors
// ============================================

const statusBadgeVariants: Record<string, string> = {
  gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  yellow:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  green: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  red: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

// ============================================
// Info Row Component
// ============================================

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white">
        {value}
      </span>
    </div>
  );
}

// ============================================
// Component
// ============================================

export function ContractDetailDialog({
  contract,
  open,
  onClose,
}: ContractDetailDialogProps) {
  const t = useTranslations("portal.contract");
  const tEnums = useTranslations("enums");

  if (!contract) return null;

  const statusColor = getContractStatusColor(contract.status);
  const isTerminated = contract.status === "TERMINATED";
  const daysUntilExpiry = contract.daysUntilExpiry;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <span>{t("detail")}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Contract Number & Status */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {contract.contractNumber}
            </span>
            <Badge className={cn("border-0", statusBadgeVariants[statusColor])}>
              {getEnumLabel("contractStatus", contract.status, tEnums)}
            </Badge>
          </div>

          <Separator />

          {/* Contract Info */}
          <div className="space-y-1">
            <InfoRow
              label={t("type")}
              value={getEnumLabel(
                "contractType",
                contract.contractType,
                tEnums,
              )}
            />
            <InfoRow
              label={t("startDate")}
              value={formatDate(contract.startDate)}
            />
            <InfoRow
              label={t("endDate")}
              value={formatDate(contract.endDate)}
            />
            {daysUntilExpiry !== undefined && daysUntilExpiry > 0 && (
              <InfoRow
                label={t("remaining")}
                value={
                  <span
                    className={cn(
                      daysUntilExpiry <= 30
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "",
                    )}
                  >
                    {t("expiresIn", { days: daysUntilExpiry })}
                  </span>
                }
              />
            )}
          </div>

          {/* Termination Info */}
          {isTerminated && (
            <>
              <Separator />
              <div className="rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
                <div className="mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">
                    {t("terminationInfo")}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  {contract.terminationDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-red-500" />
                      <span className="text-red-600 dark:text-red-400">
                        {formatDate(contract.terminationDate)}
                      </span>
                    </div>
                  )}
                  {contract.terminationReason && (
                    <p className="text-red-600 dark:text-red-400">
                      {contract.terminationReason}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {contract.notes && (
            <>
              <Separator />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("notes")}
                </span>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {contract.notes}
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { ContractDetailDialogProps };
