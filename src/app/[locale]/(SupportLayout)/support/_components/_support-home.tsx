"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Building, Receipt, MessageSquare } from "lucide-react";
import Link from "next/link";
import { GlassSection } from "@/app/[locale]/_components/_glass-style";
import { Skeleton } from "@/components/ui/skeleton";
import { referralApi } from "@/lib/apis/referral-api";
import { commissionApi } from "@/lib/apis/commission-api";
import { feedbackApi } from "@/lib/apis/feedback-api";
import { formatCurrency } from "@/lib/utils/format-currency";
import type { CommissionSummary } from "@/types/referral";
import type { CommissionSummaryResponse } from "@/types/commission";

interface SupportStats {
  totalReferrals: number;
  totalCommissionAmount: number;
  pendingCommissions: number;
  paidCommissions: number;
  totalFeedbacks: number;
  openFeedbacks: number;
}

/**
 * Trang tổng quan hỗ trợ khách hàng
 * Hiển thị thống kê và shortcut đến các tính năng chính
 */
export function SupportHome() {
  const t = useTranslations("support");
  const [stats, setStats] = useState<SupportStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [summaryData, commissionData, feedbacksData, openFeedbacksData] =
          await Promise.all([
            referralApi.getCommissionSummary().catch(() => null),
            commissionApi.getMySummary().catch(() => null),
            feedbackApi.getAdminFeedbacks(0, 1).catch(() => null),
            feedbackApi.getAdminFeedbacks(0, 1, "OPEN").catch(() => null),
          ]);

        setStats({
          totalReferrals:
            (summaryData as CommissionSummary)?.totalReferrals ?? 0,
          totalCommissionAmount:
            (commissionData as CommissionSummaryResponse)?.totalAmount ?? 0,
          pendingCommissions:
            (commissionData as CommissionSummaryResponse)?.pendingCommissions ??
            0,
          paidCommissions:
            (commissionData as CommissionSummaryResponse)?.paidCommissions ?? 0,
          totalFeedbacks: feedbacksData?.totalElements ?? 0,
          openFeedbacks: openFeedbacksData?.totalElements ?? 0,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const cards = [
    {
      title: t("navigation.referrals"),
      href: "/support/referrals",
      icon: Building,
      value: stats?.totalReferrals ?? 0,
      label: t("home.companies"),
      color: "text-blue-600",
    },
    {
      title: t("navigation.commissions"),
      href: "/support/commissions",
      icon: Receipt,
      value: formatCurrency(stats?.totalCommissionAmount ?? 0),
      label: `${stats?.pendingCommissions ?? 0} ${t("home.pending")} · ${stats?.paidCommissions ?? 0} ${t("home.paid")}`,
      color: "text-green-600",
    },
    {
      title: t("navigation.feedbacks"),
      href: "/support/feedbacks",
      icon: MessageSquare,
      value: stats?.totalFeedbacks ?? 0,
      label: `${stats?.openFeedbacks ?? 0} ${t("home.open")}`,
      color: "text-yellow-600",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Link key={card.href} href={card.href}>
          <GlassSection className="h-full transition-colors hover:bg-accent/50">
            <div className="flex items-center gap-3 mb-3">
              <card.icon className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium text-sm">{card.title}</h3>
            </div>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          </GlassSection>
        </Link>
      ))}
    </div>
  );
}
