import { apiServer } from "@/lib/utils/fetch-server";
import { SubscriptionStatus } from "@/types/subscription";
import { PlansWrapper } from "./_plans-wrapper";

export default async function PlansPage() {
  const subscription = await apiServer.get<SubscriptionStatus>(
    "/api/company/subscription",
  );

  return (
    <PlansWrapper
      currentPlanId={subscription.currentPlanId}
      currentPlanPrice={subscription.currentPlanPrice}
      isInFreeTrial={subscription.isInFreeTrial}
      scheduledPlanId={subscription.scheduledPlanId}
      scheduledPlanName={subscription.scheduledPlanName}
      scheduledPlanEffectiveDate={subscription.scheduledPlanEffectiveDate}
      canCancelUpgrade={subscription.canCancelUpgrade}
      cancelUpgradeDeadline={subscription.cancelUpgradeDeadline}
      previousPlanName={subscription.previousPlanName}
      availablePlans={subscription.availablePlans}
    />
  );
}
