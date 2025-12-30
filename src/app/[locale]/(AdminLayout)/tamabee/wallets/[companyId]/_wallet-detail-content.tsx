"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { WalletResponse } from "@/types/wallet";
import { getByCompanyId } from "@/lib/apis/wallet-api";
import { WalletCard } from "@/app/[locale]/(AdminLayout)/company/wallet/_wallet-card";
import { AdminTransactionTable } from "./_admin-transaction-table";
import { RefundForm } from "../_refund-form";
import { DirectWalletForm, DirectWalletOperation } from "./_direct-wallet-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw, Plus, Minus } from "lucide-react";
import { SupportedLocale } from "@/lib/utils/format-currency";
import { useAuth } from "@/hooks/use-auth";
import { isAdminTamabee } from "@/types/permissions";

interface WalletDetailContentProps {
  companyId: number;
  locale: SupportedLocale;
}

/**
 * Client component hiển thị chi tiết wallet của một công ty
 */
export function WalletDetailContent({
  companyId,
  locale,
}: WalletDetailContentProps) {
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations("wallet");
  const tCommon = useTranslations("common");

  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Refund form state
  const [refundFormOpen, setRefundFormOpen] = useState(false);

  // Direct wallet form state (Admin only)
  const [directWalletFormOpen, setDirectWalletFormOpen] = useState(false);
  const [directWalletOperation, setDirectWalletOperation] =
    useState<DirectWalletOperation>("add");

  // Kiểm tra quyền Admin
  const canDirectManipulate = user?.role ? isAdminTamabee(user.role) : false;

  // Fetch wallet
  const fetchWallet = useCallback(async () => {
    if (isNaN(companyId)) {
      setError(t("notFound"));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getByCompanyId(companyId);
      setWallet(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch wallet:", err);
      setError(t("messages.errorLoading"));
      toast.error(t("messages.errorLoading"));
    } finally {
      setLoading(false);
    }
  }, [companyId, t]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  // Handle refresh
  const handleRefresh = () => {
    fetchWallet();
    setRefreshTrigger((prev) => prev + 1);
  };

  // Handle refund
  const handleRefund = () => {
    setRefundFormOpen(true);
  };

  // Handle refund success
  const handleRefundSuccess = () => {
    handleRefresh();
  };

  // Handle add balance (Admin only)
  const handleAddBalance = () => {
    setDirectWalletOperation("add");
    setDirectWalletFormOpen(true);
  };

  // Handle deduct balance (Admin only)
  const handleDeductBalance = () => {
    setDirectWalletOperation("deduct");
    setDirectWalletFormOpen(true);
  };

  // Handle direct wallet success
  const handleDirectWalletSuccess = () => {
    handleRefresh();
  };

  // Handle back
  const handleBack = () => {
    router.push(`/${locale}/tamabee/wallets`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t("walletDetail")}</h1>
            {wallet && (
              <p className="text-muted-foreground">
                Company ID: {wallet.companyId}
              </p>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={loading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          {tCommon("refresh")}
        </Button>
      </div>

      {/* Wallet Card */}
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
        <div className="space-y-4">
          <WalletCard
            wallet={wallet}
            locale={locale}
            showActions={true}
            onRefund={handleRefund}
          />

          {/* Admin-only: Add/Deduct Balance buttons */}
          {canDirectManipulate && (
            <div className="flex gap-3 max-w-md">
              <Button
                onClick={handleAddBalance}
                variant="default"
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("addBalance")}
              </Button>
              <Button
                onClick={handleDeductBalance}
                variant="destructive"
                className="flex-1"
              >
                <Minus className="h-4 w-4 mr-2" />
                {t("deductBalance")}
              </Button>
            </div>
          )}
        </div>
      ) : null}

      {/* Transaction History */}
      {!error && wallet && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t("transactions")}</h2>
          <AdminTransactionTable
            companyId={companyId}
            locale={locale}
            refreshTrigger={refreshTrigger}
          />
        </div>
      )}

      {/* Refund Form Dialog */}
      {wallet && (
        <RefundForm
          open={refundFormOpen}
          onOpenChange={setRefundFormOpen}
          companyId={companyId}
          companyName={`Company ${companyId}`}
          onSuccess={handleRefundSuccess}
        />
      )}

      {/* Direct Wallet Form Dialog (Admin only) */}
      {wallet && canDirectManipulate && (
        <DirectWalletForm
          open={directWalletFormOpen}
          onOpenChange={setDirectWalletFormOpen}
          companyId={companyId}
          companyName={`Company ${companyId}`}
          currentBalance={wallet.balance}
          operation={directWalletOperation}
          onSuccess={handleDirectWalletSuccess}
        />
      )}
    </div>
  );
}
