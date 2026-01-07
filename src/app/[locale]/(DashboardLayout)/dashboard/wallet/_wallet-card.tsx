"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/format-date";
import { cn } from "@/lib/utils";
import { Plus, Calendar, Building2 } from "lucide-react";

/**
 * Data interface cho WalletCard
 */
export interface SharedWalletData {
  balance: number;
  companyName?: string;
  planName?: string;
  nextBillingDate?: string;
  isFreeTrialActive?: boolean;
  freeTrialEndDate?: string;
}

interface WalletCardProps {
  wallet: SharedWalletData;
  locale?: SupportedLocale;
  showActions?: boolean;
  onDeposit?: () => void;
}

/**
 * Card hiển thị thông tin ví
 */
export function WalletCard({
  wallet,
  locale = "vi",
  showActions = true,
  onDeposit,
}: WalletCardProps) {
  const t = useTranslations("wallet");

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>{t("card.title")}</span>
          {wallet.companyName && (
            <span className="text-sm font-normal text-muted-foreground flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {wallet.companyName}
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
              wallet.balance > 0 ? "text-green-600" : "text-red-600",
            )}
          >
            {formatCurrency(wallet.balance, locale)}
          </p>
        </div>

        {/* Thông tin gói */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {wallet.planName && (
            <div>
              <p className="text-muted-foreground">{t("card.plan")}</p>
              <p className="font-medium">{wallet.planName}</p>
            </div>
          )}

          {wallet.isFreeTrialActive && wallet.freeTrialEndDate ? (
            <div>
              <p className="text-muted-foreground">{t("card.trialEnds")}</p>
              <p className="font-medium text-orange-600">
                {formatDate(wallet.freeTrialEndDate, locale)}
              </p>
            </div>
          ) : wallet.nextBillingDate ? (
            <div>
              <p className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {t("card.nextBilling")}
              </p>
              <p className="font-medium">
                {formatDate(wallet.nextBillingDate, locale)}
              </p>
            </div>
          ) : null}
        </div>

        {/* Free trial badge */}
        {wallet.isFreeTrialActive && (
          <div className="rounded-md bg-orange-100 dark:bg-orange-900/20 px-3 py-2 text-sm text-orange-700 dark:text-orange-400">
            {t("card.freeTrialActive")}
          </div>
        )}

        {/* Actions */}
        {showActions && onDeposit && (
          <Button onClick={onDeposit} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {t("card.deposit")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
