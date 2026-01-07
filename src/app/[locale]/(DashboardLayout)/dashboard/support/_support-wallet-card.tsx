"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WalletOverviewResponse } from "@/types/wallet";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/format-date";
import { cn } from "@/lib/utils";
import { Calendar, Building2 } from "lucide-react";

interface SupportWalletCardProps {
  company: WalletOverviewResponse;
  locale?: SupportedLocale;
}

/**
 * Wallet card cho Employee Support (read-only)
 */
export function SupportWalletCard({
  company,
  locale = "vi",
}: SupportWalletCardProps) {
  const t = useTranslations("wallet");

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>{t("card.title")}</span>
          {company.companyName && (
            <span className="text-sm font-normal text-muted-foreground flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {company.companyName}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Số dư */}
        <div>
          <p className="text-sm text-muted-foreground">{t("card.balance")}</p>
          <p
            className={cn(
              "text-3xl font-bold",
              company.balance > 0 ? "text-green-600" : "text-red-600",
            )}
          >
            {formatCurrency(company.balance, locale)}
          </p>
        </div>

        {/* Thông tin gói */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {company.planName && (
            <div>
              <p className="text-muted-foreground">{t("card.plan")}</p>
              <p className="font-medium">{company.planName}</p>
            </div>
          )}

          {company.isFreeTrialActive && company.freeTrialEndDate ? (
            <div>
              <p className="text-muted-foreground">{t("card.trialEnds")}</p>
              <p className="font-medium text-orange-600">
                {formatDate(company.freeTrialEndDate, locale)}
              </p>
            </div>
          ) : company.nextBillingDate ? (
            <div>
              <p className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {t("card.nextBilling")}
              </p>
              <p className="font-medium">
                {formatDate(company.nextBillingDate, locale)}
              </p>
            </div>
          ) : null}
        </div>

        {/* Free trial badge */}
        {company.isFreeTrialActive && (
          <div className="rounded-md bg-orange-100 dark:bg-orange-900/20 px-3 py-2 text-sm text-orange-700 dark:text-orange-400">
            {t("card.freeTrialActive")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
