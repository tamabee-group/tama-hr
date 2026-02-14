"use client";

import { useState } from "react";
import { PlansContent } from "./_plans-content";
import { PlanHistoryTable } from "./_plan-history-table";
import { PlanEligibility } from "@/types/subscription";

interface PlansWrapperProps {
  currentPlanId: number | null;
  currentPlanPrice: number | null;
  isInFreeTrial: boolean;
  scheduledPlanId: number | null;
  scheduledPlanName: string | null;
  scheduledPlanEffectiveDate: string | null;
  canCancelUpgrade: boolean;
  cancelUpgradeDeadline: string | null;
  previousPlanName: string | null;
  availablePlans: PlanEligibility[];
}

export function PlansWrapper(props: PlansWrapperProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePlanChanged = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      <PlansContent {...props} onPlanChanged={handlePlanChanged} />
      <PlanHistoryTable refreshKey={refreshKey} />
    </>
  );
}
