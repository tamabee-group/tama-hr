"use client";

import { useState } from "react";
import { ReferredCompany } from "@/types/referral";
import { CommissionSummaryCard } from "./_commission-summary-card";
import { ReferralTable } from "./_referral-table";
import { ReferralDetailDialog } from "./_referral-detail-dialog";

/**
 * Client component chính cho trang Referrals
 * Quản lý state và hiển thị các sub-components
 * @client-only
 */
export function ReferralsPageContent() {
  const [selectedCompany, setSelectedCompany] =
    useState<ReferredCompany | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Xử lý khi click vào row để xem chi tiết
  const handleRowClick = (company: ReferredCompany) => {
    setSelectedCompany(company);
  };

  // Đóng dialog chi tiết
  const handleCloseDetail = () => {
    setSelectedCompany(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Công ty đã giới thiệu</h1>
        <p className="text-muted-foreground">
          Danh sách các công ty bạn đã giới thiệu và trạng thái hoa hồng
        </p>
      </div>

      {/* Commission Summary Card */}
      <CommissionSummaryCard refreshTrigger={refreshTrigger} />

      {/* Referral Table */}
      <ReferralTable
        onRowClick={handleRowClick}
        refreshTrigger={refreshTrigger}
      />

      {/* Detail Dialog */}
      <ReferralDetailDialog
        company={selectedCompany}
        open={!!selectedCompany}
        onClose={handleCloseDetail}
      />
    </div>
  );
}
