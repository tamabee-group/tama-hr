"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("wallet.statistics");

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <Card className="py-2">
        <CardContent>
          <p className="text-sm text-muted-foreground">{t("totalCompanies")}</p>
          <p className="text-2xl font-bold">{statistics.totalCompanies}</p>
        </CardContent>
      </Card>

      <Card className="py-2">
        <CardContent>
          <p className="text-sm text-muted-foreground">{t("totalBalance")}</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(statistics.totalBalance, locale)}
          </p>
        </CardContent>
      </Card>

      <Card className="py-2">
        <CardContent>
          <p className="text-sm text-muted-foreground">{t("lowBalance")}</p>
          <p className="text-2xl font-bold text-yellow-600">
            {statistics.companiesWithLowBalance}
          </p>
        </CardContent>
      </Card>

      <Card className="py-2">
        <CardContent>
          <p className="text-sm text-muted-foreground">{t("freeTrial")}</p>
          <p className="text-2xl font-bold text-blue-600">
            {statistics.companiesInFreeTrial}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
