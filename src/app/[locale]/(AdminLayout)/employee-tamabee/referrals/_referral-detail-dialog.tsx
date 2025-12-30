"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  User,
  CreditCard,
  Wallet,
  TrendingUp,
  Award,
  Calendar,
} from "lucide-react";
import { ReferredCompany } from "@/types/referral";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { formatDateTime } from "@/lib/utils/format-date";
import { COMMISSION_STATUS_COLORS, CommissionStatus } from "@/types/enums";
import { vi, ja, enUS } from "date-fns/locale";
import { useLocale } from "next-intl";

interface ReferralDetailDialogProps {
  company: ReferredCompany | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Dialog hiển thị chi tiết công ty đã giới thiệu
 * Bao gồm thông tin service usage và commission status
 * @client-only
 */
export function ReferralDetailDialog({
  company,
  open,
  onClose,
}: ReferralDetailDialogProps) {
  const t = useTranslations("referrals");
  const tEnums = useTranslations("enums");
  const locale = useLocale() as SupportedLocale;

  if (!company) return null;

  // Get date-fns locale
  const getDateLocale = () => {
    switch (locale) {
      case "vi":
        return vi;
      case "ja":
        return ja;
      default:
        return enUS;
    }
  };

  // Lấy className cho commission status badge
  const getCommissionBadgeClassName = (status: CommissionStatus): string => {
    const color = COMMISSION_STATUS_COLORS[status] || "warning";
    if (color === "warning") {
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200";
    }
    if (color === "info") {
      return "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200";
    }
    if (color === "success") {
      return "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200";
    }
    return "";
  };

  // Format ngày thanh toán hoa hồng
  const formatPaidDate = (dateStr?: string) => {
    if (!dateStr) return t("detail.notPaid");
    return formatDateTime(dateStr, locale);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t("detail.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Thông tin công ty */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              {t("detail.companyInfo")}
            </h3>
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{t("detail.companyName")}</span>
                </div>
                <span className="font-medium">{company.companyName}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{t("detail.owner")}</span>
                </div>
                <span className="font-medium">{company.ownerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  <span>{t("detail.plan")}</span>
                </div>
                <Badge variant="outline">{company.planName}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>{t("detail.status")}</span>
                </div>
                <Badge
                  variant="secondary"
                  className={
                    company.status === "ACTIVE"
                      ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200"
                      : ""
                  }
                >
                  {company.status === "ACTIVE"
                    ? t("status.active")
                    : t("status.inactive")}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Thông tin tài chính */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              {t("detail.financialInfo")}
            </h3>
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wallet className="h-4 w-4" />
                  <span>{t("detail.currentBalance")}</span>
                </div>
                <span className="font-medium text-green-600">
                  {formatCurrency(company.currentBalance, locale)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>{t("detail.totalDeposits")}</span>
                </div>
                <span className="font-medium">
                  {formatCurrency(company.totalDeposits, locale)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  <span>{t("detail.totalBilling")}</span>
                </div>
                <span className="font-medium">
                  {formatCurrency(company.totalBilling, locale)}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Thông tin hoa hồng */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              {t("detail.commissionInfo")}
            </h3>
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Award className="h-4 w-4" />
                  <span>{t("detail.commissionAmount")}</span>
                </div>
                <span className="font-medium text-cyan-600">
                  {formatCurrency(company.commissionAmount, locale)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>{t("detail.commissionStatus")}</span>
                </div>
                <Badge
                  variant="secondary"
                  className={getCommissionBadgeClassName(
                    company.commissionStatus,
                  )}
                >
                  {tEnums(`commissionStatus.${company.commissionStatus}`)}
                </Badge>
              </div>
              {company.commissionPaidAt && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{t("detail.paidDate")}</span>
                  </div>
                  <span className="font-medium">
                    {formatPaidDate(company.commissionPaidAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
