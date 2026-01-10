"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Company, getCompanyPlanName } from "@/types/company";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/format-date";
import { Wallet } from "lucide-react";

interface SubscriptionCardProps {
  company: Company;
}

export function SubscriptionCard({ company }: SubscriptionCardProps) {
  const t = useTranslations("companies");
  const params = useParams();
  const locale = (params.locale as SupportedLocale) || "vi";

  const isFreeTrial = company.isFreeTrialActive;
  const planName = getCompanyPlanName(company, locale as "vi" | "en" | "ja");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("subscription.title")}</CardTitle>
          <Button size="sm" asChild>
            <Link href={`/${locale}/dashboard/wallet`}>
              <Wallet className="h-4 w-4 mr-2" />
              {t("subscription.manageWallet")}
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {t("subscription.plan")}
            </p>
            <p className="text-lg font-semibold text-blue-600">{planName}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {t("subscription.monthlyPrice")}
            </p>
            <p className="text-lg font-semibold">
              {company.planMonthlyPrice != null
                ? formatCurrency(company.planMonthlyPrice)
                : "-"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {t("subscription.maxEmployees")}
            </p>
            <p className="text-lg font-semibold">
              {company.planMaxEmployees != null
                ? company.planMaxEmployees === -1
                  ? t("subscription.unlimited")
                  : company.planMaxEmployees
                : "-"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {t("subscription.walletBalance")}
            </p>
            <p
              className={`text-lg font-semibold ${
                company.walletBalance != null && company.walletBalance > 0
                  ? "text-green-600"
                  : company.walletBalance != null && company.walletBalance <= 0
                    ? "text-red-600"
                    : ""
              }`}
            >
              {company.walletBalance != null
                ? formatCurrency(company.walletBalance)
                : "-"}
            </p>
          </div>

          {isFreeTrial && company.freeTrialEndDate && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {t("subscription.freeTrialEnd")}
              </p>
              <p className="text-lg font-semibold text-yellow-600">
                {formatDate(company.freeTrialEndDate, locale)}
              </p>
            </div>
          )}

          {!isFreeTrial && company.nextBillingDate && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {t("subscription.nextBilling")}
              </p>
              <p className="text-lg font-semibold">
                {formatDate(company.nextBillingDate, locale)}
              </p>
            </div>
          )}

          {company.lastBillingDate && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {t("subscription.lastBilling")}
              </p>
              <p className="text-lg font-semibold">
                {formatDate(company.lastBillingDate, locale)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
