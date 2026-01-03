"use client";

import { useState, useEffect, useCallback } from "react";
import { WorkMode, WorkModeConfig } from "@/types/attendance-config";
import { getWorkModeConfig } from "@/lib/apis/company-settings-api";

/**
 * Hook để lấy và cache work mode config của company
 * @client-only
 */
export function useWorkMode() {
  const [workMode, setWorkMode] = useState<WorkMode | null>(null);
  const [workModeConfig, setWorkModeConfig] = useState<WorkModeConfig | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWorkMode = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const config = await getWorkModeConfig();
      setWorkModeConfig(config);
      setWorkMode(config.mode);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch work mode"),
      );
      // Default to FLEXIBLE_SHIFT nếu có lỗi
      setWorkMode("FLEXIBLE_SHIFT");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkMode();
  }, [fetchWorkMode]);

  // Hàm refresh để gọi lại API khi cần
  const refresh = useCallback(() => {
    fetchWorkMode();
  }, [fetchWorkMode]);

  return {
    workMode,
    workModeConfig,
    loading,
    error,
    refresh,
    isFixedHours: workMode === "FIXED_HOURS",
    isFlexibleShift: workMode === "FLEXIBLE_SHIFT",
  };
}
