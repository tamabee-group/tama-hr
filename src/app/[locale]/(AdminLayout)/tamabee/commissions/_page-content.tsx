"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { commissionApi } from "@/lib/apis/commission-api";
import { CommissionPage } from "../../_components/_shared/_commission-page";
import { CommissionTable } from "../../_components/_shared/_commission-table";
import { CommissionSummary } from "../../_components/_shared/_commission-summary";

/**
 * Client component chứa state và logic cho trang quản lý hoa hồng Tamabee Admin
 * Sử dụng các shared components: CommissionPage, CommissionTable, CommissionSummary
 */
export function TamabeeCommissionsPageContent() {
  const t = useTranslations("commissions");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  /** Callback làm mới dữ liệu */
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  /** Callback đánh dấu đã thanh toán */
  const handleMarkAsPaid = async (id: number) => {
    await commissionApi.markAsPaid(id);
  };

  return (
    <CommissionPage
      title={t("title")}
      description={t("description")}
      tableComponent={
        <CommissionTable
          fetchCommissions={commissionApi.getAll}
          showEmployeeFilter={true}
          showMarkAsPaid={true}
          onMarkAsPaid={handleMarkAsPaid}
          refreshTrigger={refreshTrigger}
          onRefresh={handleRefresh}
        />
      }
      summaryComponent={
        <CommissionSummary
          fetchSummary={commissionApi.getSummary}
          refreshTrigger={refreshTrigger}
        />
      }
      onRefresh={handleRefresh}
    />
  );
}
