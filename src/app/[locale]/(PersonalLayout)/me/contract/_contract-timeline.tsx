"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { FileText, ChevronRight } from "lucide-react";
import { GlassCard } from "../../../_components/_glass-style/_glass-card";
import { Badge } from "@/components/ui/badge";
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

interface ContractTimelineProps {
  contracts: PortalContractResponse[];
  onContractClick: (contract: PortalContractResponse) => void;
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

// Timeline dot colors
const timelineDotColors: Record<string, string> = {
  gray: "bg-gray-400",
  yellow: "bg-yellow-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  red: "bg-red-500",
};

// ============================================
// Component
// ============================================

export function ContractTimeline({
  contracts,
  onContractClick,
}: ContractTimelineProps) {
  const t = useTranslations("portal.contract");
  const tEnums = useTranslations("enums");

  // Sắp xếp theo ngày bắt đầu (mới nhất trước)
  const sortedContracts = React.useMemo(() => {
    return [...contracts].sort((a, b) => {
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });
  }, [contracts]);

  // Không có hợp đồng
  if (sortedContracts.length === 0) {
    return (
      <GlassCard className="p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t("noHistory")}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t("noHistoryDescription")}
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      {/* Header */}
      <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
        {t("history")}
      </h3>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-3 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700" />

        {/* Timeline items */}
        <div className="space-y-4">
          {sortedContracts.map((contract, index) => {
            const statusColor = getContractStatusColor(contract.status);
            const isFirst = index === 0;

            return (
              <button
                key={contract.id}
                type="button"
                onClick={() => onContractClick(contract)}
                className={cn(
                  "relative flex w-full items-start gap-4 rounded-xl p-3 text-left transition-colors",
                  "hover:bg-gray-50 dark:hover:bg-white/5",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                )}
                aria-label={`${t("viewContract")} ${contract.contractNumber}`}
              >
                {/* Timeline dot */}
                <div
                  className={cn(
                    "relative z-10 mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full",
                    timelineDotColors[statusColor],
                    isFirst &&
                      "ring-4 ring-offset-2 ring-offset-white dark:ring-offset-gray-900",
                    isFirst &&
                      statusColor === "green" &&
                      "ring-green-200 dark:ring-green-900",
                  )}
                />

                {/* Contract info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "border-0 text-xs",
                        statusBadgeVariants[statusColor],
                      )}
                    >
                      {getEnumLabel(
                        "contractType",
                        contract.contractType,
                        tEnums,
                      )}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "border-0 text-xs",
                        statusBadgeVariants[statusColor],
                      )}
                    >
                      {getEnumLabel("contractStatus", contract.status, tEnums)}
                    </Badge>
                  </div>

                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                    {contract.contractNumber}
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(contract.startDate)} -{" "}
                    {formatDate(contract.endDate)}
                  </p>
                </div>

                {/* Arrow */}
                <ChevronRight className="mt-2 h-4 w-4 flex-shrink-0 text-gray-400" />
              </button>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}

export type { ContractTimelineProps };
