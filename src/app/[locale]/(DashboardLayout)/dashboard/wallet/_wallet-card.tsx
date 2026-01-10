"use client";

import { useTranslations } from "next-intl";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/format-date";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";

/**
 * Interface chung cho wallet data
 * Hỗ trợ cả WalletResponse và WalletOverviewResponse
 */
export interface SharedWalletData {
  balance: number;
  companyName?: string;
  planName?: string;
  nextBillingDate?: string;
  isFreeTrialActive?: boolean;
  freeTrialEndDate?: string;
}

interface SharedWalletCardProps {
  /** Data wallet - hỗ trợ cả WalletResponse và WalletOverviewResponse */
  wallet: SharedWalletData;
  /** Locale cho format tiền tệ */
  locale?: SupportedLocale;
  /** Hiển thị action buttons */
  showActions?: boolean;
  /** Callback nạp tiền */
  onDeposit?: () => void;
  /** Callback hoàn tiền */
  onRefund?: () => void;
}

/**
 * Component hiển thị thông tin ví dạng credit card
 * Design giống thẻ ngân hàng thật với tông màu teal (#00b1ce)
 */
export function WalletCard({
  wallet,
  locale = "vi",
  showActions = false,
  onDeposit,
  onRefund,
}: SharedWalletCardProps) {
  const t = useTranslations("wallet");

  return (
    <div className="space-y-4">
      {/* Credit Card Style */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 shadow-xl aspect-[1.6/1] max-w-md"
        style={{
          background:
            "linear-gradient(135deg, #00b1ce 0%, #0891b2 50%, #00b1ce 100%)",
        }}
      >
        {/* Decorative wave curves */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 400 250"
          preserveAspectRatio="none"
        >
          <path
            d="M0,150 Q100,100 200,150 T400,120 L400,250 L0,250 Z"
            fill="rgba(255,255,255,0.08)"
          />
          <path
            d="M0,180 Q150,130 300,180 T400,160 L400,250 L0,250 Z"
            fill="rgba(255,255,255,0.05)"
          />
          <ellipse
            cx="350"
            cy="50"
            rx="80"
            ry="80"
            fill="rgba(255,255,255,0.06)"
          />
          <ellipse
            cx="380"
            cy="100"
            rx="50"
            ry="50"
            fill="rgba(255,255,255,0.04)"
          />
        </svg>

        {/* SIM Chip + Contactless - bên phải */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center">
          {/* SIM Chip */}
          <svg width="45" height="35" viewBox="0 0 45 35">
            <defs>
              <linearGradient
                id="chipGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#d4af37" />
                <stop offset="50%" stopColor="#f4d03f" />
                <stop offset="100%" stopColor="#c9a227" />
              </linearGradient>
            </defs>
            <rect
              x="0"
              y="0"
              width="45"
              height="35"
              rx="4"
              fill="url(#chipGradient)"
            />
            {/* Chip lines */}
            <rect x="5" y="8" width="35" height="2" fill="#b8960c" rx="1" />
            <rect x="5" y="14" width="35" height="2" fill="#b8960c" rx="1" />
            <rect x="5" y="20" width="35" height="2" fill="#b8960c" rx="1" />
            <rect x="5" y="26" width="35" height="2" fill="#b8960c" rx="1" />
            <rect x="14" y="5" width="2" height="25" fill="#b8960c" rx="1" />
            <rect x="29" y="5" width="2" height="25" fill="#b8960c" rx="1" />
          </svg>
        </div>

        {/* Card content */}
        <div className="relative h-full flex flex-col justify-between">
          {/* Header: Company name + Trial badge */}
          <div className="flex items-start justify-between">
            <p className="text-white font-semibold text-lg truncate max-w-[200px]">
              {wallet.companyName || "-"}
            </p>
            {wallet.isFreeTrialActive ? (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 text-amber-200 text-xs font-medium">
                <Gift className="h-3 w-3" />
                {t("card.freeTrial")}
              </div>
            ) : (
              <span className="text-yellow-200/80 font-semibold">TAMABEE</span>
            )}
          </div>

          {/* Balance - center */}
          <p className="text-white text-xl font-bold tracking-tight">
            {formatCurrency(wallet.balance)}
          </p>

          {/* Footer: Plan + Date */}
          <div className="flex justify-between items-end">
            <div>
              <p className="text-white/60 text-[10px] uppercase">
                {t("card.plan")}
              </p>
              <p className="text-white text-sm font-semibold">
                {wallet.planName || "-"}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-[10px] uppercase">
                {wallet.isFreeTrialActive
                  ? t("card.expires")
                  : t("card.billing")}
              </p>
              <p className="text-white text-sm font-semibold">
                {wallet.isFreeTrialActive
                  ? formatDate(wallet.freeTrialEndDate, locale)
                  : formatDate(wallet.nextBillingDate, locale)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons - bên ngoài card */}
      {showActions && (
        <div className="flex gap-3 max-w-md">
          {onDeposit && (
            <Button onClick={onDeposit} className="flex-1">
              {t("card.deposit")}
            </Button>
          )}
          {onRefund && (
            <Button variant="outline" onClick={onRefund} className="flex-1">
              {t("card.refund")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
