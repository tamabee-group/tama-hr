"use client";

import { useTranslations } from "next-intl";
import { Calendar } from "lucide-react";
import { GlassCard } from "../../../_components/_glass-style/_glass-card";
import { Progress } from "@/components/ui/progress";
import { LeaveTypeBadge } from "@/app/[locale]/_components/_shared/display/_status-badge";
import { LeaveBalance as LeaveBalanceType } from "@/types/attendance-records";

// ============================================
// Types
// ============================================

interface LeaveBalanceProps {
  balances: LeaveBalanceType[];
}

// ============================================
// Component
// ============================================

export function LeaveBalance({ balances }: LeaveBalanceProps) {
  const t = useTranslations("portal.leave");
  const tCommon = useTranslations("common");

  if (balances.length === 0) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">{t("balance")}</h3>
        </div>
        <p className="text-muted-foreground text-center py-4">
          {tCommon("noData")}
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Calendar className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">{t("balance")}</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {balances.map((balance) => {
          const usedPercentage =
            balance.totalDays > 0
              ? (balance.usedDays / balance.totalDays) * 100
              : 0;

          return (
            <div
              key={balance.leaveType}
              className="p-4 rounded-2xl bg-white/50 dark:bg-white/5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <LeaveTypeBadge type={balance.leaveType} />
                <span className="text-lg font-bold text-primary">
                  {balance.remainingDays}
                </span>
              </div>

              <Progress value={usedPercentage} className="h-2" />

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {t("used")}: {balance.usedDays} / {balance.totalDays}
                </span>
                {balance.pendingDays > 0 && (
                  <span className="text-yellow-600">
                    {t("pending")}: {balance.pendingDays}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
