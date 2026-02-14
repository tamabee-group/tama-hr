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

  return selectedCompany ? (
    <CompanyDetail company={selectedCompany} onBack={handleBack} />
  ) : (
    <CompanySearch onSelectCompany={handleSelectCompany} />
  );
}
