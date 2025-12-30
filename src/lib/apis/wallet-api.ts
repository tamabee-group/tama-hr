import { apiClient } from "@/lib/utils/fetch-client";
import {
  WalletResponse,
  WalletOverviewResponse,
  WalletStatisticsResponse,
  WalletTransactionResponse,
  TransactionFilterRequest,
  WalletFilterRequest,
  RefundRequest,
  DirectWalletRequest,
  DirectWalletResponse,
} from "@/types/wallet";
import {
  PaginatedResponse,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from "@/types/api";

/**
 * Wallet API functions
 * @client-only - Chỉ sử dụng được ở client side
 */

// ============================================
// Company APIs - Dành cho ADMIN_COMPANY, MANAGER_COMPANY
// ============================================

/**
 * Lấy thông tin ví của công ty hiện tại
 * @client-only
 */
export async function getMyWallet(): Promise<WalletResponse> {
  return apiClient.get<WalletResponse>("/api/company/wallet");
}

/**
 * Lấy danh sách giao dịch của công ty hiện tại
 * @client-only
 */
export async function getMyTransactions(
  filter?: TransactionFilterRequest,
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResponse<WalletTransactionResponse>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  if (filter?.transactionType) {
    params.append("transactionType", filter.transactionType);
  }
  if (filter?.startDate) {
    params.append("startDate", filter.startDate);
  }
  if (filter?.endDate) {
    params.append("endDate", filter.endDate);
  }

  return apiClient.get<PaginatedResponse<WalletTransactionResponse>>(
    `/api/company/wallet/transactions?${params.toString()}`,
  );
}

// ============================================
// Admin APIs - Dành cho ADMIN_TAMABEE, MANAGER_TAMABEE
// ============================================

/**
 * Lấy danh sách tổng quan wallet của tất cả công ty
 * @client-only
 */
export async function getOverview(
  filter?: WalletFilterRequest,
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResponse<WalletOverviewResponse>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  if (filter?.minBalance !== undefined) {
    params.append("minBalance", filter.minBalance.toString());
  }
  if (filter?.maxBalance !== undefined) {
    params.append("maxBalance", filter.maxBalance.toString());
  }
  if (filter?.isFreeTrialActive !== undefined) {
    params.append("isFreeTrialActive", filter.isFreeTrialActive.toString());
  }
  if (filter?.companyName) {
    params.append("companyName", filter.companyName);
  }

  return apiClient.get<PaginatedResponse<WalletOverviewResponse>>(
    `/api/admin/wallets?${params.toString()}`,
  );
}

/**
 * Lấy thống kê tổng hợp wallet
 * @client-only
 */
export async function getStatistics(): Promise<WalletStatisticsResponse> {
  return apiClient.get<WalletStatisticsResponse>(
    "/api/admin/wallets/statistics",
  );
}

/**
 * Lấy thông tin wallet của một công ty cụ thể
 * @client-only
 */
export async function getByCompanyId(
  companyId: number,
): Promise<WalletResponse> {
  return apiClient.get<WalletResponse>(`/api/admin/wallets/${companyId}`);
}

/**
 * Lấy danh sách giao dịch của một công ty cụ thể
 * @client-only
 */
export async function getTransactionsByCompanyId(
  companyId: number,
  filter?: TransactionFilterRequest,
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResponse<WalletTransactionResponse>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  if (filter?.transactionType) {
    params.append("transactionType", filter.transactionType);
  }
  if (filter?.startDate) {
    params.append("startDate", filter.startDate);
  }
  if (filter?.endDate) {
    params.append("endDate", filter.endDate);
  }

  return apiClient.get<PaginatedResponse<WalletTransactionResponse>>(
    `/api/admin/wallets/${companyId}/transactions?${params.toString()}`,
  );
}

/**
 * Tạo hoàn tiền cho công ty
 * @client-only
 */
export async function createRefund(
  companyId: number,
  data: RefundRequest,
): Promise<WalletTransactionResponse> {
  return apiClient.post<WalletTransactionResponse>(
    `/api/admin/wallets/${companyId}/refund`,
    data,
  );
}

/**
 * Thêm tiền trực tiếp vào wallet - CHỈ ADMIN_TAMABEE
 * @client-only
 */
export async function addBalanceDirect(
  companyId: number,
  request: DirectWalletRequest,
): Promise<DirectWalletResponse> {
  return apiClient.post<DirectWalletResponse>(
    `/api/admin/wallets/${companyId}/add`,
    request,
  );
}

/**
 * Trừ tiền trực tiếp từ wallet - CHỈ ADMIN_TAMABEE
 * @client-only
 */
export async function deductBalanceDirect(
  companyId: number,
  request: DirectWalletRequest,
): Promise<DirectWalletResponse> {
  return apiClient.post<DirectWalletResponse>(
    `/api/admin/wallets/${companyId}/deduct`,
    request,
  );
}

// ============================================
// Employee APIs - Dành cho EMPLOYEE_TAMABEE (Support)
// ============================================

/**
 * Tìm kiếm công ty theo tên (cho Employee Support)
 * @client-only
 */
export async function searchCompanies(
  companyName: string,
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResponse<WalletOverviewResponse>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());
  params.append("companyName", companyName);

  return apiClient.get<PaginatedResponse<WalletOverviewResponse>>(
    `/api/admin/wallets?${params.toString()}`,
  );
}

// ============================================
// Wallet API object - Export tất cả functions
// ============================================

export const walletApi = {
  // Company APIs
  getMyWallet,
  getMyTransactions,

  // Admin APIs
  getOverview,
  getStatistics,
  getByCompanyId,
  getTransactionsByCompanyId,
  createRefund,
  addBalanceDirect,
  deductBalanceDirect,

  // Employee APIs (Support)
  searchCompanies,
};
