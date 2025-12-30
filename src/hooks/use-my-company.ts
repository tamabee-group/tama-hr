"use client";

import { useState, useEffect } from "react";
import { Company } from "@/types/company";
import { getMyCompany } from "@/lib/apis/company-api";

/**
 * Hook để lấy thông tin company của user đang đăng nhập
 * @client-only
 */
export function useMyCompany() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        const data = await getMyCompany();
        setCompany(data);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch company"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, []);

  return { company, loading, error };
}
