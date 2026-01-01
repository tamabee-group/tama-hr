"use client";

import { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/auth/storage";

/**
 * Thông tin company cơ bản từ currentUser
 */
export interface MyCompanyInfo {
  id: number;
  name: string;
  logo?: string;
}

/**
 * Hook để lấy thông tin company của user đang đăng nhập
 * Sử dụng thông tin từ localStorage (currentUser) thay vì fetch API
 * @client-only
 */
export function useMyCompany() {
  const [company, setCompany] = useState<MyCompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      setLoading(true);
      const currentUser = getCurrentUser();

      if (currentUser && currentUser.companyId) {
        setCompany({
          id: currentUser.companyId,
          name: currentUser.companyName || "",
        });
      } else {
        setError(new Error("Company information not found"));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to get company info"),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return { company, loading, error };
}
