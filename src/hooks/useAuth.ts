"use client";

import { useContext } from "react";
import { AuthContext } from "@/lib/auth/AuthContext";

/**
 * Hook để sử dụng auth context
 * @client-only - Chỉ sử dụng được ở client side (React hook)
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth phải được sử dụng trong AuthProvider");
  }
  return context;
}
