"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { WalletResponse } from "@/types/wallet";
import { getMyWallet } from "@/lib/apis/wallet-api";
import { useAuth } from "@/lib/auth";
import { WalletCard } from "./_wallet-card";
import { TransactionChart } from "./_transaction-chart";
import { TransactionTable } from "./_transaction-table";
import { DepositTable } from "./_deposit-table";
import { DepositForm } from "./_deposit-form";
import { ImageModal } from "./_image-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SupportedLocale } from "@/lib/utils/format-currency";

interface PageContentProps {
  locale: SupportedLocale;
}

/**
 * Client component chứa logic và state cho Company Wallet page
 * Hiển thị thông tin ví, lịch sử giao dịch và yêu cầu nạp tiền
 */
export function PageContent({ locale }: PageContentProps) {
  const { user } = useAuth();
  const t = useTranslations("wallet");
  const tDeposits = useTranslations("deposits");
  const tErrors = useTranslations("errors");
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [depositFormOpen, setDepositFormOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);

  /** Fetch thông tin ví */
  const fetchWallet = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyWallet();
      setWallet(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch wallet:", err);
      setError(tErrors("generic"));
    } finally {
      setLoading(false);
    }
  }, [tErrors]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  /** Mở form nạp tiền */
  const handleDeposit = () => {
    setDepositFormOpen(true);
  };

  /** Xử lý sau khi nạp tiền thành công */
  const handleDepositSuccess = () => {
    fetchWallet();
    setRefreshTrigger((prev) => prev + 1);
  };

  /** Xem ảnh chứng minh chuyển khoản */
  const handleViewImage = (imageUrl: string) => {
    setImageModalUrl(imageUrl);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {/* Wallet Card + Chart */}
      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Wallet Card - width cố định */}
        <div className="lg:w-[360px] lg:shrink-0">
          {loading ? (
            <div className="rounded-xl border p-6 space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-48" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          ) : error ? (
            <div className="rounded-xl border p-6 text-center text-destructive">
              {error}
            </div>
          ) : wallet ? (
            <WalletCard
              wallet={wallet}
              locale={locale}
              showActions={true}
              onDeposit={handleDeposit}
            />
          ) : null}
        </div>

        {/* Transaction Chart - chiếm phần còn lại */}
        <div className="flex-1 min-w-0">
          <TransactionChart locale={locale} refreshTrigger={refreshTrigger} />
        </div>
      </div>

      {/* Tabs: Giao dịch / Yêu cầu nạp tiền */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">{t("transactions")}</TabsTrigger>
          <TabsTrigger value="deposits">{tDeposits("title")}</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <TransactionTable locale={locale} refreshTrigger={refreshTrigger} />
        </TabsContent>

        <TabsContent value="deposits">
          <DepositTable
            locale={locale}
            onViewImage={handleViewImage}
            refreshTrigger={refreshTrigger}
          />
        </TabsContent>
      </Tabs>

      {/* Deposit Form Dialog */}
      <DepositForm
        open={depositFormOpen}
        onOpenChange={setDepositFormOpen}
        onSuccess={handleDepositSuccess}
        locale={locale}
      />

      {/* Image Modal */}
      <ImageModal
        open={!!imageModalUrl}
        onOpenChange={(open) => !open && setImageModalUrl(null)}
        imageUrl={imageModalUrl || ""}
        locale={locale}
      />
    </div>
  );
}
