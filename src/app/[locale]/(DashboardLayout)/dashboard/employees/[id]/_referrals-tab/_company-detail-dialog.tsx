"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReferredCompany } from "@/types/employee-detail";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatDate, formatDateTime } from "@/lib/utils/format-date";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { CommissionStatus } from "@/types/enums";

interface CompanyDetailDialogProps {
  company: ReferredCompany | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Lấy className cho commission status badge
function getCommissionStatusClassName(status: CommissionStatus): string {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "ELIGIBLE":
      return "bg-blue-100 text-blue-800";
    case "PAID":
      return "bg-green-100 text-green-800";
    default:
      return "";
  }
}

export function CompanyDetailDialog({
  company,
  open,
  onOpenChange,
}: CompanyDetailDialogProps) {
  const t = useTranslations("referrals");
  const tEnums = useTranslations("enums");

  if (!company) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>{t("detail.title")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("detail.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* Thông tin công ty */}
          <Card className="py-4 gap-0">
            <CardHeader>
              <CardTitle className="text-base">
                {t("detail.companyInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("detail.companyName")}
                </span>
                <span className="font-medium">{company.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("detail.owner")}
                </span>
                <span>{company.ownerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("detail.email")}
                </span>
                <span>{company.email || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("detail.phone")}
                </span>
                <span>{company.phone || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("detail.plan")}
                </span>
                <span>
                  {company.planName || "-"}
                  {company.planPrice != null && company.planPrice > 0 && (
                    <span className="text-muted-foreground ml-1">
                      ({formatCurrency(company.planPrice)}/tháng)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("detail.planExpiry")}
                </span>
                <span>
                  {company.planExpiryDate
                    ? formatDate(company.planExpiryDate)
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  {t("detail.status")}
                </span>
                <Badge
                  variant="secondary"
                  className={
                    company.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : ""
                  }
                >
                  {getEnumLabel("userStatus", company.status, tEnums)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Thông tin tài chính */}
          <Card className="py-4 gap-0">
            <CardHeader>
              <CardTitle className="text-base">
                {t("detail.financialInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("detail.currentBalance")}
                </span>
                <span className="font-medium text-blue-600">
                  {formatCurrency(company.currentBalance)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("detail.totalDeposits")}
                </span>
                <span className="text-green-600">
                  {formatCurrency(company.totalDeposits)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("detail.totalBilling")}
                </span>
                <span className="text-orange-600">
                  {formatCurrency(company.totalBilling)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Thông tin hoa hồng */}
          <Card className="py-4 gap-0">
            <CardHeader>
              <CardTitle className="text-base">
                {t("detail.commissionInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("detail.commissionAmount")}
                </span>
                <span className="font-medium">
                  {company.commissionAmount
                    ? formatCurrency(company.commissionAmount)
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  {t("detail.commissionStatus")}
                </span>
                {company.commissionStatus ? (
                  <Badge
                    variant="secondary"
                    className={getCommissionStatusClassName(
                      company.commissionStatus,
                    )}
                  >
                    {getEnumLabel(
                      "commissionStatus",
                      company.commissionStatus,
                      tEnums,
                    )}
                  </Badge>
                ) : (
                  <span>-</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("detail.paidDate")}
                </span>
                <span>
                  {company.commissionPaidAt
                    ? formatDateTime(company.commissionPaidAt)
                    : t("detail.notPaid")}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
