"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { FileText, Calendar, AlertTriangle } from "lucide-react";
import { GlassCard } from "../../../_components/_glass-style/_glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface CurrentContractCardProps {
  contract: PortalContractResponse | null;
  onViewDetail: () => void;
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
// Component
// ============================================

export function CurrentContractCard({
  contract,
  onViewDetail,
}: CurrentContractCardProps) {
  const t = useTranslations("portal.contract");
  const tEnums = useTranslations("enums");

  // Không có hợp đồng hiện tại
  if (!contract) {
    return (
      <GlassCard variant="highlighted" className="p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t("noContract")}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t("noContractDescription")}
          </p>
        </div>
      </GlassCard>
    );
  }

  const statusColor = getContractStatusColor(contract.status);
  const daysUntilExpiry = contract.daysUntilExpiry;
  const isExpiringSoon =
    daysUntilExpiry !== undefined &&
    daysUntilExpiry <= 30 &&
    daysUntilExpiry > 0;

  return (
    <GlassCard variant="highlighted" className="p-6">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-3">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("current")}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {contract.contractNumber}
            </p>
          </div>
        </div>
        <Badge className={cn("border-0", statusBadgeVariants[statusColor])}>
          {getEnumLabel("contractStatus", contract.status, tEnums)}
        </Badge>
      </div>

      {/* Contract Info */}
      <div className="mb-4 space-y-3">
        {/* Loại hợp đồng */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t("type")}
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {getEnumLabel("contractType", contract.contractType, tEnums)}
          </span>
        </div>

        {/* Thời hạn */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t("period")}
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
          </span>
        </div>

        {/* Số ngày còn lại */}
        {daysUntilExpiry !== undefined && daysUntilExpiry > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t("remaining")}
            </span>
            <div className="flex items-center gap-2">
              {isExpiringSoon && (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
              <span
                className={cn(
                  "font-medium",
                  isExpiringSoon
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-gray-900 dark:text-white",
                )}
              >
                {t("expiresIn", { days: daysUntilExpiry })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Cảnh báo sắp hết hạn */}
      {isExpiringSoon && (
        <div className="mb-4 rounded-xl bg-yellow-50 p-3 dark:bg-yellow-900/20">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm text-yellow-700 dark:text-yellow-300">
              {t("expiringWarning")}
            </span>
          </div>
        </div>
      )}

      {/* View Detail Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={onViewDetail}
        aria-label={t("viewDetail")}
      >
        {t("viewDetail")}
      </Button>
    </GlassCard>
  );
}

export type { CurrentContractCardProps };
