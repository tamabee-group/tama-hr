export interface PlanEligibility {
  id: number;
  name: string;
  description: string | null;
  monthlyPrice: number;
  maxEmployees: number | null;
  isActive: boolean;
  eligible: boolean;
  ineligibleReason: string | null;
}

export interface PlanChangeHistory {
  id: number;
  fromPlanName: string | null;
  toPlanName: string;
  fromPlanPrice: number | null;
  toPlanPrice: number;
  changeType: string;
  effectiveDate: string;
  createdAt: string;
}

export interface SubscriptionStatus {
  companyId: number;
  companyName: string;
  companyStatus: string;
  currentEmployeeCount: number;
  currentPlanId: number | null;
  currentPlanName: string | null;
  currentPlanPrice: number | null;
  currentPlanMaxEmployees: number | null;
  walletBalance: number;
  freeTrialEndDate: string | null;
  nextBillingDate: string | null;
  isInFreeTrial: boolean;
  daysUntilDeletion: number | null;
  // Scheduled plan change (downgrade)
  scheduledPlanId: number | null;
  scheduledPlanName: string | null;
  scheduledPlanPrice: number | null;
  scheduledPlanEffectiveDate: string | null;
  // Grace period cho upgrade cancellation
  canCancelUpgrade: boolean;
  cancelUpgradeDeadline: string | null;
  previousPlanId: number | null;
  previousPlanName: string | null;
  availablePlans: PlanEligibility[];
}
