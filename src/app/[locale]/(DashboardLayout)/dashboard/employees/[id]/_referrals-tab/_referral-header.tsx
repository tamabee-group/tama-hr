"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/app/[locale]/_components/_glass-style";
import { Button } from "@/components/ui/button";
import { Copy, Check, Info } from "lucide-react";
import { CommissionSummary, CommissionSettings } from "@/types/employee-detail";
import {
  getEmployeeCommissionSummary,
  getCommissionSettings,
} from "@/lib/apis/employee-referrals";
import { formatCurrency } from "@/lib/utils/format-currency";

interface ReferralHeaderProps {
  employeeId: number;
  referralCode: string;
}

export function ReferralHeader({
  employeeId,
  referralCode,
}: ReferralHeaderProps) {
  const t = useTranslations("referrals");
  const tCommon = useTranslations("common");

  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [settings, setSettings] = useState<CommissionSettings | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [summaryData, settingsData] = await Promise.all([
          getEmployeeCommissionSummary(employeeId),
          getCommissionSettings(),
        ]);
        setSummary(summaryData);
        setSettings(settingsData);
      } catch {
        // Ignore errors
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [employeeId]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="text-center py-4">{tCommon("loading")}</div>;
  }

  const commissionAmount = settings?.commissionAmount || 0;

  return (
    <div className="space-y-4">
      {/* Referral Code & Commission Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Referral Code Card */}
        <GlassCard className="p-6">
          <div className="text-sm text-muted-foreground mb-2">
            {t("header.referralCode")}
          </div>
          <div className="flex items-center gap-2">
            <code className="text-2xl font-bold tracking-wider bg-muted px-3 py-1 rounded">
              {referralCode}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </GlassCard>

        {/* Commission Info Card */}
        <GlassCard className="p-6">
          <div className="text-sm text-muted-foreground mb-2">
            {t("header.commissionInfo")}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>{t("header.commissionAmount")}</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(commissionAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t("header.bonusMonths")}</span>
              <span className="font-semibold">
                {settings?.referralBonusMonths || 1} {t("header.months")}
              </span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Commission Hint */}
      <GlassCard className="p-6 bg-blue-50/70 dark:bg-blue-900/20 border-blue-200/80 dark:border-blue-500/30">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">{t("header.hintTitle")}</p>
            <p>
              {t("header.hintContent", {
                amount: formatCurrency(commissionAmount),
              })}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Summary Statistics */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard className="p-6">
            <div className="text-sm text-muted-foreground">
              {t("summary.totalReferrals")}
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {summary.totalReferrals}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="text-sm text-muted-foreground">
              {t("summary.pendingAmount")}
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(summary.pendingAmount || 0)}
            </div>
            <div className="text-xs text-muted-foreground">
              {summary.pendingCommissions} {t("summary.commissions")}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="text-sm text-muted-foreground">
              {t("summary.eligibleAmount")}
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary.eligibleAmount || 0)}
            </div>
            <div className="text-xs text-muted-foreground">
              {summary.eligibleCommissions} {t("summary.commissions")}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="text-sm text-muted-foreground">
              {t("summary.paidAmount")}
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.paidAmount || 0)}
            </div>
            <div className="text-xs text-muted-foreground">
              {summary.paidCommissions} {t("summary.commissions")}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
