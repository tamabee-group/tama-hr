"use client";

import { useContext } from "react";
import { PlanFeaturesContext } from "@/providers/plan-features-provider";
import { PlanFeaturesContextType } from "@/types/plan";

/**
 * Hook để sử dụng plan features context
 * Expose features array và hasFeature helper
 * @client-only - Chỉ sử dụng được ở client side (React hook)
 */
export function usePlanFeatures(): PlanFeaturesContextType {
  const context = useContext(PlanFeaturesContext);
  if (context === undefined) {
    throw new Error(
      "usePlanFeatures phải được sử dụng trong PlanFeaturesProvider",
    );
  }
  return context;
}
