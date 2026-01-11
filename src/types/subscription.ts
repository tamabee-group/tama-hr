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
  availablePlans: PlanEligibility[];
}
