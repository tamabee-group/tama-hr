"use client";

import {
  createContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "@/hooks/use-auth";
import { planApi } from "@/lib/apis/plan-api";
import { PlanFeature, PlanFeaturesContextType } from "@/types/plan";
import { hasFeature as hasFeatureUtil } from "@/lib/utils/has-feature";

// Context với default value
export const PlanFeaturesContext = createContext<
  PlanFeaturesContextType | undefined
>(undefined);

interface PlanFeaturesProviderProps {
  children: ReactNode;
}

/**
 * Provider quản lý plan features cho dynamic sidebar
 * Fetch features từ API khi user login
 * @client-only
 */
export function PlanFeaturesProvider({ children }: PlanFeaturesProviderProps) {
  const { user, status } = useAuth();
  const [features, setFeatures] = useState<PlanFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch features từ API
  const fetchFeatures = useCallback(async (planId: number) => {
    setIsLoading(true);
    try {
      const response = await planApi.getPlanFeatures(planId);
      setFeatures(response.features);
    } catch (error) {
      console.error("Lỗi khi fetch plan features:", error);
      setFeatures([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh features (dùng khi plan thay đổi)
  const refresh = useCallback(async () => {
    if (user?.planId !== undefined && user?.planId !== null) {
      await fetchFeatures(user.planId);
    }
  }, [user?.planId, fetchFeatures]);

  // Fetch features khi user login
  useEffect(() => {
    if (
      status === "authenticated" &&
      user?.planId !== undefined &&
      user?.planId !== null
    ) {
      fetchFeatures(user.planId);
    } else if (status === "unauthenticated") {
      // Clear features khi logout
      setFeatures([]);
    }
  }, [status, user?.planId, fetchFeatures]);

  // Helper function để check feature
  const hasFeature = useCallback(
    (code: string): boolean => {
      return hasFeatureUtil(features, code);
    },
    [features],
  );

  return (
    <PlanFeaturesContext.Provider
      value={{ features, isLoading, hasFeature, refresh }}
    >
      {children}
    </PlanFeaturesContext.Provider>
  );
}
