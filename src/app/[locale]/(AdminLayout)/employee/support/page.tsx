"use client";

import { useState } from "react";
import { WalletOverviewResponse } from "@/types/wallet";
import { CompanySearch } from "./_company-search";
import { CompanyDetail } from "./_company-detail";

/**
 * Trang hỗ trợ khách hàng cho Employee Tamabee
 * - Tìm kiếm công ty
 * - Xem thông tin wallet, transactions, deposits (read-only)
 */
export default function EmployeeSupportPage() {
  const [selectedCompany, setSelectedCompany] =
    useState<WalletOverviewResponse | null>(null);

  const handleSelectCompany = (company: WalletOverviewResponse) => {
    setSelectedCompany(company);
  };

  const handleBack = () => {
    setSelectedCompany(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Hỗ trợ khách hàng</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tìm kiếm và xem thông tin ví, giao dịch của công ty
        </p>
      </div>

      {/* Content */}
      {selectedCompany ? (
        <CompanyDetail company={selectedCompany} onBack={handleBack} />
      ) : (
        <CompanySearch onSelectCompany={handleSelectCompany} />
      )}
    </div>
  );
}
