"use client";

import { useState } from "react";
import { commissionApi } from "@/lib/apis/commission-api";
import { CommissionPage } from "../../_components/_shared/_commission-page";
import { CommissionTable } from "../../_components/_shared/_commission-table";
import { CommissionSummary } from "../../_components/_shared/_commission-summary";

/**
 * Client component chứa state và logic cho trang hoa hồng của Employee Tamabee
 * Sử dụng các shared components với API dành cho employee (filter by current employee)
 */
export function EmployeeCommissionsPageContent() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  /** Callback làm mới dữ liệu */
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <CommissionPage
      title="Hoa hồng của tôi"
      description="Xem danh sách hoa hồng từ các công ty bạn đã giới thiệu"
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
