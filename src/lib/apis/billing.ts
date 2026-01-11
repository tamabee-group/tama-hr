import { apiClient } from "@/lib/utils/fetch-client";

/**
 * Billing API functions
 * @client-only - Chỉ sử dụng được ở client side
 */

/**
 * Trigger billing thủ công cho tất cả company đến hạn
 */
export async function triggerBilling(): Promise<string> {
  return apiClient.post<string>("/api/admin/billing/trigger");
}

/**
 * Kiểm tra company có đang trong free trial không
 */
export async function checkFreeTrial(companyId: number): Promise<boolean> {
  return apiClient.get<boolean>(`/api/admin/billing/free-trial/${companyId}`);
}

/**
 * Setup test data cho billing
 */
export async function setupBillingTest(
  companyId: number,
  daysAgo: number = 1,
  balance: number = 10000,
): Promise<string> {
  return apiClient.post<string>(
    `/api/admin/billing/setup-test/${companyId}?daysAgo=${daysAgo}&balance=${balance}`,
  );
}

export const billingApi = {
  triggerBilling,
  checkFreeTrial,
  setupBillingTest,
};
