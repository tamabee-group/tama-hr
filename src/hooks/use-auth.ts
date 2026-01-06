"use client";

import { useContext, useMemo } from "react";
import { AuthContext, AuthContextType } from "@/lib/auth/AuthContext";
import {
  isTamabeeUser as checkIsTamabeeUser,
  isTamabeeAdmin as checkIsTamabeeAdmin,
  isCompanyAdmin as checkIsCompanyAdmin,
} from "@/types/auth";

// Extended auth context với helper properties
export interface UseAuthReturn extends AuthContextType {
  isTamabeeUser: boolean; // tenantDomain === "tamabee"
  isTamabeeAdmin: boolean; // ADMIN_TAMABEE || MANAGER_TAMABEE
  isCompanyAdmin: boolean; // ADMIN_COMPANY || MANAGER_COMPANY
}

/**
 * Hook để sử dụng auth context với helper properties
 * @client-only - Chỉ sử dụng được ở client side (React hook)
 */
export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth phải được sử dụng trong AuthProvider");
  }

  // Memoize helper properties để tránh re-compute không cần thiết
  const helpers = useMemo(
    () => ({
      isTamabeeUser: checkIsTamabeeUser(context.user),
      isTamabeeAdmin: checkIsTamabeeAdmin(context.user),
      isCompanyAdmin: checkIsCompanyAdmin(context.user),
    }),
    [context.user],
  );

  return {
    ...context,
    ...helpers,
  };
}
