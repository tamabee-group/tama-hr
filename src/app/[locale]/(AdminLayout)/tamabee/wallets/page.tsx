"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { WalletStatisticsResponse } from "@/types/wallet";
import { getStatistics } from "@/lib/apis/wallet-api";
import { StatisticsCards } from "./_statistics-cards";
import { WalletOverviewTable } from "./_wallet-overview-table";
import { RefundForm } from "./_refund-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { SupportedLocale } from "@/lib/utils/format-currency";

/**
 * Trang quản lý Wallets cho Tamabee Admin
 * - Hiển thị statistics cards
 * - Hiển thị wallet overview table
 * - Hỗ trợ hoàn tiền cho từng công ty
 */
export default function TamabeeWalletsPage() {
  const params = useParams();
  const locale = (params.locale as SupportedLocale) || "vi";
  const t = useTranslations("wallet");
  const tCommon = useTranslations("common");

  const [statistics, setStatistics] = useState<WalletStatisticsResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Refund form state
  const [refundFormOpen, setRefundFormOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getStatistics();
      setStatistics(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch statistics:", err);
      setError(t("messages.errorLoading"));
      toast.error(t("messages.errorLoading"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // Handle refresh
  const handleRefresh = () => {
    fetchStatistics();
    setRefreshTrigger((prev) => prev + 1);
  };

  // Handle refund click
  const handleRefund = (companyId: number, companyName: string) => {
    setSelectedCompany({ id: companyId, name: companyName });
    setRefundFormOpen(true);
  };

  // Handle refund success
  const handleRefundSuccess = () => {
    handleRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("description")}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          {tCommon("refresh")}
        </Button>
      </div>

      {/* Statistics Cards */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border p-6 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border p-6 text-center text-destructive">
          {error}
        </div>
      ) : statistics ? (
        <StatisticsCards statistics={statistics} locale={locale} />
      ) : null}

      {/* Wallet Overview Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t("companyList")}</h2>
        <WalletOverviewTable
          locale={locale}
          refreshTrigger={refreshTrigger}
          onRefund={handleRefund}
        />
      </div>

      {/* Refund Form Dialog */}
      {selectedCompany && (
        <RefundForm
          open={refundFormOpen}
          onOpenChange={setRefundFormOpen}
          companyId={selectedCompany.id}
          companyName={selectedCompany.name}
          onSuccess={handleRefundSuccess}
        />
      )}
    </div>
  );
}
