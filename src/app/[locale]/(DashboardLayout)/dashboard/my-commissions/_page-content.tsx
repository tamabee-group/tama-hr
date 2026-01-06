"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { commissionApi } from "@/lib/apis/commission-api";
import { CommissionPage } from "@/app/[locale]/(AdminLayout)/_components/_shared/_commission-page";
import { CommissionTable } from "@/app/[locale]/(AdminLayout)/_components/_shared/_commission-table";
import { CommissionSummary } from "@/app/[locale]/(AdminLayout)/_components/_shared/_commission-summary";

/**
 * Client component chứa state và logic cho trang hoa hồng của Employee
 * Sử dụng các shared components: CommissionPage, CommissionTable, CommissionSummary
 * Employee chỉ xem được hoa hồng của mình (read-only, không có filter employee và mark as paid)
 */
export function EmployeeCommissionsPageContent() {
  const t = useTranslations("commissions");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  /** Callback làm mới dữ liệu */
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <CommissionPage
      title={t("myCommissions")}
      description={t("myDescription")}
      tableComponent={
        <CommissionTable
          fetchCommissions={commissionApi.getMyCommissions}
          showEmployeeFilter={false}
          showMarkAsPaid={false}
          refreshTrigger={refreshTrigger}
          onRefresh={handleRefresh}
        />
      }
      summaryComponent={
        <CommissionSummary
          fetchSummary={commissionApi.getMySummary}
          refreshTrigger={refreshTrigger}
        />
      }
      onRefresh={handleRefresh}
    />
  );
}
