"use client";

import { SharedTransactionTable } from "@/app/[locale]/(AdminLayout)/_components/_shared/_transaction-table";
import { getMyTransactions } from "@/lib/apis/wallet-api";
import { SupportedLocale } from "@/lib/utils/format-currency";

interface TransactionTableProps {
  locale?: SupportedLocale;
  refreshTrigger?: number;
}

/**
 * Component hiển thị bảng giao dịch (Company version)
 * Sử dụng SharedTransactionTable với API getMyTransactions
 */
export function TransactionTable({
  locale = "vi",
  refreshTrigger,
}: TransactionTableProps) {
  return (
    <SharedTransactionTable
      fetchTransactions={(filter, page, size) =>
        getMyTransactions(filter, page, size)
      }
      locale={locale}
      refreshTrigger={refreshTrigger}
    />
  );
}

/**
 * Re-export các helper functions cho testing
 */
export {
  isTransactionsSortedDescending,
  isTransactionsMatchFilter,
} from "@/app/[locale]/(AdminLayout)/_components/_shared/_transaction-table";
