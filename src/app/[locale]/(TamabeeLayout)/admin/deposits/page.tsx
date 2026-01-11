"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { SupportedLocale } from "@/lib/utils/format-currency";
import { DepositRequestResponse } from "@/types/deposit";
import { AdminDepositTable } from "./_deposit-table";
import { DepositDetailDialog } from "./_deposit-detail-dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

/**
 * Trang quản lý yêu cầu nạp tiền (Tamabee Admin)
 * - Hiển thị danh sách tất cả deposit requests
 * - Tab navigation: All, Pending, Approved, Rejected
 * - Dialog chi tiết với chức năng duyệt/từ chối
 */
export default function AdminDepositsPage() {
  const params = useParams();
  const locale = (params.locale as SupportedLocale) || "vi";
  const t = useTranslations("deposits");
  const tCommon = useTranslations("common");

  const [selectedDeposit, setSelectedDeposit] =
    useState<DepositRequestResponse | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleViewDetail = (deposit: DepositRequestResponse) => {
    setSelectedDeposit(deposit);
    setDetailDialogOpen(true);
  };

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("description")}
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {tCommon("refresh")}
        </Button>
      </div>

      <AdminDepositTable
        locale={locale}
        onViewDetail={handleViewDetail}
        refreshTrigger={refreshTrigger}
      />

      <DepositDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        deposit={selectedDeposit}
        onSuccess={handleSuccess}
        locale={locale}
        canApproveReject={true}
      />
    </div>
  );
}
