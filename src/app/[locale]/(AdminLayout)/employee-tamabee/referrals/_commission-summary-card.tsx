"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, CheckCircle, Wallet, Users } from "lucide-react";
import { handleApiError } from "@/lib/utils/api-error-handler";
import { CommissionSummary } from "@/types/referral";
import { referralApi } from "@/lib/apis/referral-api";
import { formatCurrency } from "@/lib/utils/format-currency";

interface CommissionSummaryCardProps {
  refreshTrigger?: number;
}

/**
 * Component hiển thị tổng hợp hoa hồng cho Employee Tamabee
 * Hiển thị: total pending, eligible, paid amounts
 * @client-only
 */
export function CommissionSummaryCard({
  refreshTrigger,
}: CommissionSummaryCardProps) {
  const t = useTranslations("referrals");
  const tErrors = useTranslations("errors");
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch summary data
  const loadSummary = useCallback(async () => {
    setLoading(true);
    try {
      const data = await referralApi.getCommissionSummary();
      setSummary(data);
    } catch (error) {
      console.error("Failed to fetch commission summary:", error);
      handleApiError(error, {
        defaultMessage: tErrors("generic"),
      });
    } finally {
      setLoading(false);
    }
  }, [tErrors]);

  useEffect(() => {
    loadSummary();
  }, [refreshTrigger, loadSummary]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-md border p-5 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!summary) {
    return null;
  }

  // Summary cards config
  const summaryCards = [
    {
      title: t("summary.totalReferrals"),
      value: (summary.totalReferrals ?? 0).toString(),
      icon: Users,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: t("summary.pendingAmount"),
      value: formatCurrency(summary.totalPendingAmount ?? 0, "vi"),
      subValue: `${summary.pendingCommissions ?? 0} ${t("summary.commissions")}`,
      icon: Clock,
      iconColor: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: t("summary.eligibleAmount"),
      value: formatCurrency(summary.totalEligibleAmount ?? 0, "vi"),
      subValue: `${summary.eligibleCommissions ?? 0} ${t("summary.commissions")}`,
      icon: CheckCircle,
      iconColor: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      title: t("summary.paidAmount"),
      value: formatCurrency(summary.totalPaidAmount ?? 0, "vi"),
      subValue: `${summary.paidCommissions ?? 0} ${t("summary.commissions")}`,
      icon: Wallet,
      iconColor: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ];

  return (
    <div className="grid gap-2 md:gap-4 grid-cols-2 md:grid-cols-4">
      {summaryCards.map((card, index) => (
        <Card key={index} className="gap-2 py-2 justify-between">
          <CardHeader className="flex flex-row items-center justify-between px-4">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            {card.subValue && (
              <p className="text-xs text-muted-foreground mt-1">
                {card.subValue}
              </p>
            )}
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
