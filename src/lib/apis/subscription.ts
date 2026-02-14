import { apiClient } from "@/lib/utils/fetch-client";
import { PlanChangeHistory, SubscriptionStatus } from "@/types/subscription";

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  return apiClient.get<SubscriptionStatus>("/api/company/subscription");
}

export async function changePlan(planId: number): Promise<SubscriptionStatus> {
  return apiClient.post<SubscriptionStatus>(
    "/api/company/subscription/change-plan",
    { planId },
  );
}

/**
 * Reactivate company sau khi nạp tiền đủ
 */
export async function reactivateSubscription(): Promise<SubscriptionStatus> {
  return apiClient.post<SubscriptionStatus>(
    "/api/company/subscription/reactivate",
    {},
  );
}

/**
 * Lấy lịch sử thay đổi plan
 */
export async function getPlanChangeHistory(): Promise<PlanChangeHistory[]> {
  return apiClient.get<PlanChangeHistory[]>(
    "/api/company/subscription/history",
  );
}

/**
 * Hủy upgrade gần nhất (trong grace period 15 phút)
 */
export async function cancelUpgrade(): Promise<SubscriptionStatus> {
  return apiClient.post<SubscriptionStatus>(
    "/api/company/subscription/cancel-upgrade",
    {},
  );
}
