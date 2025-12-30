import { TransactionType } from "./enums";

// Response types cho Wallet API

/**
 * Thông tin ví của công ty
 */
export interface WalletResponse {
  id: number;
  companyId: number;
  balance: number;
  lastBillingDate: string;
  nextBillingDate: string;
  freeTrialEndDate: string;
  isFreeTrialActive: boolean;
  planName: string;
}

/**
 * Thông tin tổng quan ví (dùng cho admin view)
 * Extends WalletResponse với thêm thống kê và companyName
 */
export interface WalletOverviewResponse extends WalletResponse {
  companyName: string;
  totalDeposits: number;
  totalBillings: number;
}

/**
 * Thống kê tổng hợp wallet cho admin dashboard
 */
export interface WalletStatisticsResponse {
  totalCompanies: number;
  totalBalance: number;
  companiesWithLowBalance: number;
  companiesInFreeTrial: number;
}

/**
 * Thông tin giao dịch ví
 */
export interface WalletTransactionResponse {
  id: number;
  transactionType: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

// Request types cho Wallet API

/**
 * Filter cho danh sách giao dịch
 */
export interface TransactionFilterRequest {
  transactionType?: TransactionType;
  startDate?: string;
  endDate?: string;
}

/**
 * Filter cho danh sách wallet overview (admin)
 */
export interface WalletFilterRequest {
  minBalance?: number;
  maxBalance?: number;
  isFreeTrialActive?: boolean;
  companyName?: string;
}

/**
 * Request tạo hoàn tiền
 */
export interface RefundRequest {
  amount: number;
  reason: string;
}

/**
 * Request thêm/trừ tiền trực tiếp (chỉ Admin Tamabee)
 */
export interface DirectWalletRequest {
  amount: number;
  description: string;
}

/**
 * Response cho thao tác thêm/trừ tiền trực tiếp
 */
export interface DirectWalletResponse {
  id: number;
  walletId: number;
  transactionType: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}
