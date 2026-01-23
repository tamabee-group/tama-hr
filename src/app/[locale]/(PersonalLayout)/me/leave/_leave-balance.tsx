"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { LeaveTypeBadge } from "@/app/[locale]/_components/_shared/_status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { leaveApi } from "@/lib/apis/leave-api";
import { LeaveBalance as LeaveBalanceType } from "@/types/attendance-records";
import { getErrorMessage } from "@/lib/utils/get-error-message";

/**
 * Component hiển thị số ngày phép còn lại theo từng loại
 */
export function LeaveBalance() {
  const t = useTranslations("leave");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");

  const [balances, setBalances] = useState<LeaveBalanceType[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch leave balance
  const fetchBalance = useCallback(async () => {
    setLoading(true);
    try {
      const data = await leaveApi.getMyLeaveBalance();
      setBalances(data);
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoading(false);
    }
  }, [tErrors]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("leaveBalance")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <span className="text-muted-foreground">{tCommon("loading")}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (balances.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("leaveBalance")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            {tCommon("noData")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("leaveBalance")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {balances.map((balance) => {
          const usedPercentage =
            balance.totalDays > 0
              ? (balance.usedDays / balance.totalDays) * 100
              : 0;

          return (
            <div key={balance.leaveType} className="space-y-2">
              <div className="flex items-center justify-between">
                <LeaveTypeBadge type={balance.leaveType} />
                <span className="text-sm font-medium">
                  {balance.remainingDays} / {balance.totalDays}
                </span>
              </div>

              <Progress value={usedPercentage} className="h-2" />

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {t("balance.used")}: {balance.usedDays}
                </span>
                {balance.pendingDays > 0 && (
                  <span className="text-yellow-600">
                    {t("balance.pending")}: {balance.pendingDays}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
