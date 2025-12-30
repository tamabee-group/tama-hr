"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Company, INDUSTRY_LABELS } from "@/types/company";
import { WalletResponse } from "@/types/wallet";
import { formatDateTime, formatDate } from "@/lib/utils/format-date";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { getLocaleLabel } from "@/lib/utils/get-enum-label";
import { walletApi } from "@/lib/apis/wallet-api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface Props {
  company: Company | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog hiển thị thông tin chi tiết công ty và billing
 */
export function CompanyDetailDialog({ company, open, onOpenChange }: Props) {
  const t = useTranslations("commissions.companyDetail");
  const tEnums = useTranslations("enums");
  const params = useParams();
  const locale = (params.locale as SupportedLocale) || "vi";

  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(false);

  // Fetch wallet khi dialog mở
  useEffect(() => {
    if (open && company) {
      const fetchWallet = async () => {
        setLoadingWallet(true);
        try {
          const data = await walletApi.getByCompanyId(company.id);
          setWallet(data);
        } catch (error) {
          console.error("Failed to fetch wallet:", error);
          setWallet(null);
        } finally {
          setLoadingWallet(false);
        }
      };
      fetchWallet();
    }
  }, [open, company]);

  if (!company) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-lg">
        <DialogHeader>
          <DialogTitle>{company.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Thông tin cơ bản */}
          <div className="rounded-lg border p-4 space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">
              {t("basicInfo")}
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">{t("owner")}</p>
                <p className="font-medium">{company.ownerName || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("industry")}</p>
                <p className="font-medium">
                  {INDUSTRY_LABELS[company.industry] || company.industry || "-"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("email")}</p>
                <p className="font-medium">{company.email || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("phone")}</p>
                <p className="font-medium">{company.phone || "-"}</p>
              </div>
            </div>
          </div>

          {/* Địa chỉ */}
          <div className="rounded-lg border p-4 space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">
              {t("address")}
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="col-span-2">
                <p className="text-muted-foreground">{t("address")}</p>
                <p className="font-medium">{company.address || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("zipcode")}</p>
                <p className="font-medium">{company.zipcode || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("region")}</p>
                <p className="font-medium">
                  {company.locale
                    ? getLocaleLabel(company.locale as "vi" | "ja", tEnums)
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Thông tin billing */}
          <div className="rounded-lg border p-4 space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">
              {t("billingInfo")}
            </h4>
            {loadingWallet ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : wallet ? (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">{t("walletBalance")}</p>
                  <p className="font-medium text-lg">
                    {formatCurrency(wallet.balance, locale)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("plan")}</p>
                  <p className="font-medium">{wallet.planName || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("lastBilling")}</p>
                  <p className="font-medium">
                    {wallet.lastBillingDate
                      ? formatDate(wallet.lastBillingDate, locale)
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("nextBilling")}</p>
                  <p className="font-medium">
                    {wallet.nextBillingDate
                      ? formatDate(wallet.nextBillingDate, locale)
                      : "-"}
                  </p>
                </div>
                {wallet.isFreeTrialActive && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">{t("freeTrial")}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{t("freeTrialActive")}</Badge>
                      <span className="text-sm">
                        {t("until")}{" "}
                        {formatDate(wallet.freeTrialEndDate, locale)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("noWalletInfo")}
              </p>
            )}
          </div>

          {/* Thông tin giới thiệu */}
          {company.referredByEmployeeCode && (
            <div className="rounded-lg border p-4 space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                {t("referrer")}
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">{t("employeeCode")}</p>
                  <p className="font-medium">
                    {company.referredByEmployeeCode}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("employeeName")}</p>
                  <p className="font-medium">
                    {company.referredByEmployeeName || "-"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Thời gian */}
          <div className="rounded-lg border p-4 space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">
              {t("timestamps")}
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">{t("createdAt")}</p>
                <p className="font-medium">
                  {formatDateTime(company.createdAt, locale)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("updatedAt")}</p>
                <p className="font-medium">
                  {formatDateTime(company.updatedAt, locale)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
