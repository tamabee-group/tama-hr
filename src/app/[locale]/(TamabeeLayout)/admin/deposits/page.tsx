"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { SupportedLocale } from "@/lib/utils/format-currency";
import { DepositRequestResponse } from "@/types/deposit";
import { AdminDepositTable } from "./_deposit-table";
import { DepositDetailDialog } from "./_deposit-detail-dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { subscribeToNotificationEvents } from "@/hooks/use-notifications";
import { useNotificationHighlight } from "@/hooks/use-notification-highlight";

/**
 * Trang quản lý yêu cầu nạp tiền (Tamabee Admin)
 * - Hiển thị danh sách tất cả deposit requests
 * - Tab navigation: All, Pending, Approved, Rejected
 * - Dialog chi tiết với chức năng duyệt/từ chối
 */
export default function AdminDepositsPage() {
  const params = useParams();
  const locale = (params.locale as SupportedLocale) || "vi";
  const tCommon = useTranslations("common");

  // Highlight từ notification click
  const { highlightId, onHighlightHandled } = useNotificationHighlight();

  const [selectedDeposit, setSelectedDeposit] =
    useState<DepositRequestResponse | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleViewDetail = useCallback((deposit: DepositRequestResponse) => {
    setSelectedDeposit(deposit);
    setDetailDialogOpen(true);
  }, []);

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Subscribe to real-time notifications để auto refresh khi có deposit mới
  useEffect(() => {
    const unsubscribe = subscribeToNotificationEvents("WALLET", () => {
      setRefreshTrigger((prev) => prev + 1);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {tCommon("refresh")}
        </Button>
      </div>

      <AdminDepositTable
        locale={locale}
        onViewDetail={handleViewDetail}
        refreshTrigger={refreshTrigger}
        highlightId={highlightId ?? undefined}
        onHighlightHandled={onHighlightHandled}
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
