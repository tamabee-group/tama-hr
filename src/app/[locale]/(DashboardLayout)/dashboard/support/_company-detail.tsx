"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { WalletOverviewResponse } from "@/types/wallet";
import { SupportWalletCard } from "./_support-wallet-card";
import { SupportTransactionTable } from "./_support-transaction-table";
import { SupportDepositTable } from "./_support-deposit-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            {t("transactions")}
          </TabsTrigger>
          <TabsTrigger value="deposits" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            {t("deposit")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-6">
          <SupportTransactionTable companyId={company.companyId} />
        </TabsContent>

        <TabsContent value="deposits" className="mt-6">
          <SupportDepositTable companyId={company.companyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
