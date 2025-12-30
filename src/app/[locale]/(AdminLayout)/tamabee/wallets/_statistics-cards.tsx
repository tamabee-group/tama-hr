"use client";

import { WalletStatisticsResponse } from "@/types/wallet";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { Card, CardContent } from "@/components/ui/card";

interface StatisticsCardsProps {
  statistics: WalletStatisticsResponse;
  locale?: SupportedLocale;
}

/**
 * Component hiển thị thống kê tổng hợp wallet
 */
export function StatisticsCards({
  statistics,
  locale = "vi",
}: StatisticsCardsProps) {
  // Labels theo locale
  const labels = {
    vi: {
      totalCompanies: "Tổng công ty",
      totalBalance: "Tổng số dư",
      lowBalance: "Số dư thấp",
      freeTrial: "Đang dùng thử",
    },
    en: {
      totalCompanies: "Total Companies",
      totalBalance: "Total Balance",
      lowBalance: "Low Balance",
      freeTrial: "Free Trial",
    },
    ja: {
      totalCompanies: "総会社数",
      totalBalance: "総残高",
      lowBalance: "残高不足",
      freeTrial: "無料トライアル中",
    },
  };

  const t = labels[locale];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <Card className="py-2">
        <CardContent>
          <p className="text-sm text-muted-foreground">{t.totalCompanies}</p>
          <p className="text-2xl font-bold">{statistics.totalCompanies}</p>
        </CardContent>
      </Card>

      <Card className="py-2">
        <CardContent>
          <p className="text-sm text-muted-foreground">{t.totalBalance}</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(statistics.totalBalance, locale)}
          </p>
        </CardContent>
      </Card>

      <Card className="py-2">
        <CardContent>
          <p className="text-sm text-muted-foreground">{t.lowBalance}</p>
          <p className="text-2xl font-bold text-yellow-600">
            {statistics.companiesWithLowBalance}
          </p>
        </CardContent>
      </Card>

      <Card className="py-2">
        <CardContent>
          <p className="text-sm text-muted-foreground">{t.freeTrial}</p>
          <p className="text-2xl font-bold text-blue-600">
            {statistics.companiesInFreeTrial}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
