"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { WalletOverviewResponse } from "@/types/wallet";
import { SupportWalletCard } from "./_support-wallet-card";
import { SupportTransactionTable } from "./_support-transaction-table";
import { SupportDepositTable } from "./_support-deposit-table";
import { GlassTabs } from "@/app/[locale]/_components/_glass-style";
import { Button } from "@/components/ui/button";
import { ArrowLeft, History, Receipt } from "lucide-react";

interface CompanyDetailProps {
  company: WalletOverviewResponse;
  onBack: () => void;
}

/**
 * Component hiển thị chi tiết wallet, transactions và deposits của company (read-only)
 */
export function CompanyDetail({ company, onBack }: CompanyDetailProps) {
  const [activeTab, setActiveTab] = useState("transactions");
  const t = useTranslations("wallet");
  const tCommon = useTranslations("common");

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        {tCommon("back")}
      </Button>

      {/* Wallet Card */}
      <SupportWalletCard company={company} />

      {/* Tabs */}
      <div className="space-y-4">
        <GlassTabs
          tabs={[
            {
              value: "transactions",
              label: t("transactions"),
              icon: <History className="h-4 w-4" />,
            },
            {
              value: "deposits",
              label: t("deposit"),
              icon: <Receipt className="h-4 w-4" />,
            },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />

        <div className="mt-6">
          {activeTab === "transactions" ? (
            <SupportTransactionTable companyId={company.companyId} />
          ) : (
            <SupportDepositTable companyId={company.companyId} />
          )}
        </div>
      </div>
    </div>
  );
}
