"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Copy, Check, Gift, Building2, Clock, Wallet } from "lucide-react";
import { GlassSection } from "@/app/[locale]/_components/_glass-style";
import { useAuth } from "@/hooks/use-auth";
import { CommissionSettingsResponse } from "@/types/commission";
import { formatCurrency } from "@/lib/utils/format-currency";
import { cn } from "@/lib/utils";

interface ReferralTabProps {
  settings: CommissionSettingsResponse | null;
}

/**
 * Tab hiển thị thông tin giới thiệu và referral code
 * Nhận settings từ parent để tránh gọi API nhiều lần
 */
export function ReferralTab({ settings }: ReferralTabProps) {
  const t = useTranslations("commissions");
  const locale = useLocale();
  const { user } = useAuth();
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const referralCode = user?.profile?.referralCode || "";
  const registerUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${locale}/register?ref=${referralCode}`
      : "";

  const copyToClipboard = async (text: string, type: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "code") {
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
      } else {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const commissionAmount = settings?.commissionAmount || 5000;
  const bonusMonths =
    (settings?.freeTrialMonths || 2) + (settings?.referralBonusMonths || 1);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Referral Code & Link - Mobile: Stack, Desktop: Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Referral Code */}
        <GlassSection title={t("referral.yourCode")}>
          <button
            onClick={() => copyToClipboard(referralCode, "code")}
            className="w-full group relative bg-linear-to-r from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 rounded-xl px-4 py-4 transition-colors"
          >
            <span className="font-mono text-xl md:text-2xl font-bold tracking-widest text-primary">
              {referralCode}
            </span>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white/50 dark:bg-white/10 group-hover:bg-white/80 dark:group-hover:bg-white/20 transition-colors">
              {codeCopied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              )}
            </span>
          </button>
        </GlassSection>

        {/* Share Link */}
        <GlassSection title={t("referral.shareLink")}>
          <button
            onClick={() => copyToClipboard(registerUrl, "link")}
            className="w-full group relative bg-muted/50 hover:bg-muted/70 rounded-xl px-4 py-4 pr-12 transition-colors text-left"
          >
            <span className="text-xs md:text-sm font-mono truncate block">
              {registerUrl}
            </span>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white/50 dark:bg-white/10 group-hover:bg-white/80 dark:group-hover:bg-white/20 transition-colors">
              {linkCopied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              )}
            </span>
          </button>
        </GlassSection>
      </div>

      {/* Reward Info */}
      <GlassSection title={t("referral.reward")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/40">
              <Wallet className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {t("referral.rewardAmount")}
              </p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(commissionAmount)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
              <Gift className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {t("referral.bonusForCompany")}
              </p>
              <p className="text-lg font-bold text-blue-600">
                {t("referral.bonusMonths", { months: bonusMonths })}
              </p>
            </div>
          </div>
        </div>
      </GlassSection>

      {/* Process Steps */}
      <GlassSection title={t("referral.process")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              step: 1,
              icon: Copy,
              title: t("referral.step1Title"),
              desc: t("referral.step1Desc"),
              color: "blue",
            },
            {
              step: 2,
              icon: Building2,
              title: t("referral.step2Title"),
              desc: t("referral.step2Desc"),
              color: "purple",
            },
            {
              step: 3,
              icon: Clock,
              title: t("referral.step3Title"),
              desc: t("referral.step3Desc"),
              color: "yellow",
            },
            {
              step: 4,
              icon: Wallet,
              title: t("referral.step4Title"),
              desc: t("referral.step4Desc"),
              color: "green",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="relative p-3 rounded-xl bg-muted/30"
            >
              <div
                className={cn(
                  "absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white",
                  item.color === "blue" && "bg-blue-500",
                  item.color === "purple" && "bg-purple-500",
                  item.color === "yellow" && "bg-yellow-500",
                  item.color === "green" && "bg-green-500",
                )}
              >
                {item.step}
              </div>
              <div className="pt-2">
                <p className="font-medium text-sm mb-1">{item.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </GlassSection>

      {/* Conditions */}
      <GlassSection title={t("referral.conditions")}>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
              1
            </span>
            <span>{t("referral.condition1")}</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
              2
            </span>
            <span>
              {t("referral.condition2", {
                amount: formatCurrency(commissionAmount),
              })}
            </span>
          </li>
          <li className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
              3
            </span>
            <span>{t("referral.condition3")}</span>
          </li>
        </ul>
      </GlassSection>
    </div>
  );
}
