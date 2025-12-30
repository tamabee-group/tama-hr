"use client";

import { SupportedLocale } from "@/lib/utils/format-currency";
import { walletApi } from "@/lib/apis/wallet-api";
import { TransactionFilterRequest } from "@/types/wallet";
import { SharedTransactionTable } from "@/app/[locale]/(AdminLayout)/_components/_shared/_transaction-table";

interface SupportTransactionTableProps {
  companyId: number;
  locale?: SupportedLocale;
  refreshTrigger?: number;
}

/**
 * Transaction table cho Employee Support (read-only)
 * Sử dụng SharedTransactionTable với filter theo companyId
 */
export function SupportTransactionTable({
  companyId,
  locale = "vi",
  refreshTrigger,
}: SupportTransactionTableProps) {
  /** Fetch transactions với filter theo companyId */
  const fetchTransactions = async (
    filter: TransactionFilterRequest,
    page: number,
    size: number,
  ) => {
    return walletApi.getTransactionsByCompanyId(companyId, filter, page, size);
  };

  return (
    <SharedTransactionTable
      fetchTransactions={fetchTransactions}
      locale={locale}
      refreshTrigger={refreshTrigger}
    />
  );
}
