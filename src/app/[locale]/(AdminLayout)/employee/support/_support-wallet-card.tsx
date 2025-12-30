"use client";

import { WalletOverviewResponse } from "@/types/wallet";
import { SupportedLocale } from "@/lib/utils/format-currency";
import {
  SharedWalletCard,
  SharedWalletData,
} from "@/app/[locale]/(AdminLayout)/_components/_shared/_wallet-card";

interface SupportWalletCardProps {
  company: WalletOverviewResponse;
  locale?: SupportedLocale;
}

/**
 * Wallet card cho Employee Support (read-only)
 * Sử dụng SharedWalletCard với showActions=false
 */
export function SupportWalletCard({
  company,
  locale = "vi",
}: SupportWalletCardProps) {
  /** Chuyển đổi WalletOverviewResponse sang SharedWalletData */
  const walletData: SharedWalletData = {
    balance: company.balance,
    companyName: company.companyName,
    planName: company.planName,
    nextBillingDate: company.nextBillingDate,
    isFreeTrialActive: company.isFreeTrialActive,
    freeTrialEndDate: company.freeTrialEndDate,
  };

  return (
    <SharedWalletCard wallet={walletData} locale={locale} showActions={false} />
  );
}
