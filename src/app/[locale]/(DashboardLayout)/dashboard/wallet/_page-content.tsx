"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { WalletResponse, getWalletPlanName } from "@/types/wallet";
import { WalletTransactionResponse } from "@/types/wallet";
import { DepositRequestResponse } from "@/types/deposit";
import { getMyWallet, getMyTransactions } from "@/lib/apis/wallet-api";
import { depositApi } from "@/lib/apis/deposit-api";
import { useAuth } from "@/lib/auth";
import { WalletCard, SharedWalletData } from "./_wallet-card";
import { TransactionChart } from "./_transaction-chart";
import { TransactionTable } from "./_transaction-table";
import { DepositTable } from "./_deposit-table";
import { DepositForm } from "./_deposit-form";
import { ImageZoomDialog } from "@/app/[locale]/_components/_image-zoom-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SupportedLocale } from "@/lib/utils/format-currency";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface PageContentProps {
  locale: SupportedLocale;
}

/**
 * Client component chứa logic và state cho Dashboard Wallet page
 * Hiển thị thông tin ví, lịch sử giao dịch và yêu cầu nạp tiền
 * Fetch data 1 lần khi vào trang, filter client-side
 */
export function PageContent({ locale }: PageContentProps) {
  const { user } = useAuth();
  const t = useTranslations("wallet");
  const tDeposits = useTranslations("deposits");
  const tCommon = useTranslations("common");
  const tDialogs = useTranslations("dialogs");
  const tErrors = useTranslations("errors");

  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [transactions, setTransactions] = useState<WalletTransactionResponse[]>(
    [],
  );
  const [deposits, setDeposits] = useState<DepositRequestResponse[]>([]);
  const [minDepositAmount, setMinDepositAmount] = useState<number>(5000);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [depositFormOpen, setDepositFormOpen] = useState(false);
  const [cancelDeposit, setCancelDeposit] =
    useState<DepositRequestResponse | null>(null);
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);

  // Kiểm tra có phải Tamabee user không (companyId = 0)
  const isTamabeeUser = user?.companyId === 0;

  /** Fetch tất cả data 1 lần khi vào trang */
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch song song wallet, transactions và deposits
      const [walletData, transactionsData, depositsData, minAmountData] =
        await Promise.all([
          getMyWallet(),
          getMyTransactions({}, 0, 100),
          isTamabeeUser
            ? Promise.resolve({ content: [] })
            : depositApi.getMyRequests({}, 0, 100),
          isTamabeeUser
            ? Promise.resolve(5000)
            : depositApi.getMinDepositAmount(),
        ]);

      setWallet(walletData);
      setTransactions(transactionsData.content);
      setDeposits(depositsData.content);
      setMinDepositAmount(minAmountData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError(tErrors("generic"));
    } finally {
      setLoading(false);
    }
  }, [tErrors, isTamabeeUser]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  /** Mở form nạp tiền */
  const handleDeposit = () => {
    setDepositFormOpen(true);
  };

  /** Xử lý sau khi nạp tiền thành công - refetch all data */
  const handleDepositSuccess = () => {
    fetchAllData();
  };

  /** Xem ảnh chứng minh chuyển khoản */
  const handleViewImage = (imageUrl: string) => {
    setImageModalUrl(imageUrl);
  };

  /** Mở dialog xác nhận hủy */
  const handleCancelRequest = (deposit: DepositRequestResponse) => {
    setCancelDeposit(deposit);
  };

  /** Xác nhận hủy yêu cầu */
  const confirmCancel = async () => {
    if (!cancelDeposit) return;

    try {
      await depositApi.cancel(cancelDeposit.id);
      toast.success(tDeposits("messages.cancelSuccess"));
      // Refetch all data sau khi cancel
      fetchAllData();
    } catch (error) {
      console.error("Failed to cancel deposit:", error);
      toast.error(tDeposits("messages.cancelError"));
    } finally {
      setCancelDeposit(null);
    }
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
              wallet={
                {
                  ...wallet,
                  companyName: user?.companyName || "",
                  planName: getWalletPlanName(wallet, locale),
                } as SharedWalletData
              }
              locale={locale}
              showActions={false}
            />
          ) : null}
        </div>

        {/* Transaction Chart - chiếm phần còn lại */}
        <div className="flex-1 min-w-0">
          <TransactionChart transactions={transactions} />
        </div>
      </div>

      {/* Tabs: Giao dịch / Yêu cầu nạp tiền */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">
            {t("transactions")} ({transactions.length})
          </TabsTrigger>
          {!isTamabeeUser && (
            <TabsTrigger value="deposits">
              {tDeposits("title")} ({deposits.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="transactions">
          <TransactionTable locale={locale} data={transactions} />
        </TabsContent>

        {!isTamabeeUser && (
          <TabsContent value="deposits">
            <DepositTable
              locale={locale}
              data={deposits}
              onViewImage={handleViewImage}
              onCancel={handleCancelRequest}
              onDeposit={handleDeposit}
            />
          </TabsContent>
        )}
      </Tabs>

      {/* Deposit Form Dialog */}
      <DepositForm
        open={depositFormOpen}
        onOpenChange={setDepositFormOpen}
        onSuccess={handleDepositSuccess}
        minAmount={minDepositAmount}
      />

      {/* Image Zoom Dialog */}
      <ImageZoomDialog
        open={!!imageModalUrl}
        onOpenChange={(open) => !open && setImageModalUrl(null)}
        src={imageModalUrl || ""}
        alt={tDeposits("table.transferProof")}
      />

      {/* Cancel Confirmation Dialog */}
      <AlertDialog
        open={!!cancelDeposit}
        onOpenChange={(open) => !open && setCancelDeposit(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tDialogs("confirmCancel")}</AlertDialogTitle>
            <AlertDialogDescription>
              {tDeposits("messages.cancelConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel}>
              {tCommon("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
