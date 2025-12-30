import {
  WalletTransactionResponse,
  TransactionFilterRequest,
} from "@/types/wallet";

/**
 * Kiểm tra transactions có được sắp xếp theo createdAt giảm dần không
 * Export để sử dụng trong property test
 */
export function isTransactionsSortedDescending(
  transactions: WalletTransactionResponse[],
): boolean {
  if (transactions.length <= 1) return true;

  for (let i = 0; i < transactions.length - 1; i++) {
    const current = new Date(transactions[i].createdAt).getTime();
    const next = new Date(transactions[i + 1].createdAt).getTime();
    if (current < next) {
      return false;
    }
  }
  return true;
}

/**
 * Kiểm tra transactions có match với filter không
 * Export để sử dụng trong property test
 */
export function isTransactionsMatchFilter(
  transactions: WalletTransactionResponse[],
  filter: TransactionFilterRequest,
): boolean {
  return transactions.every((transaction) => {
    // Check transaction type
    if (
      filter.transactionType &&
      transaction.transactionType !== filter.transactionType
    ) {
      return false;
    }

    // Check start date
    if (filter.startDate) {
      const transactionDate = new Date(transaction.createdAt);
      const startDateObj = new Date(filter.startDate);
      startDateObj.setHours(0, 0, 0, 0);
      if (transactionDate < startDateObj) {
        return false;
      }
    }

    // Check end date
    if (filter.endDate) {
      const transactionDate = new Date(transaction.createdAt);
      const endDateObj = new Date(filter.endDate);
      endDateObj.setHours(23, 59, 59, 999);
      if (transactionDate > endDateObj) {
        return false;
      }
    }

    return true;
  });
}
