import { apiClient } from "@/lib/utils/fetch-client";
import { SubscriptionStatus } from "@/types/subscription";

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
