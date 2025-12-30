"use client";

import { useState, useEffect } from "react";
import { depositApi } from "@/lib/apis/deposit-api";

/**
 * Hook để lấy số lượng deposit requests đang chờ duyệt
 * @client-only - Chỉ sử dụng được ở client side
 */
export function usePendingDepositsCount() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await depositApi.getAll(
          { status: "PENDING" },
          0,
          1, // Chỉ cần lấy totalElements
        );
        setCount(response.totalElements);
      } catch (error) {
        console.error("Failed to fetch pending deposits count:", error);
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();

    // Refresh count mỗi 30 giây
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return { count, loading };
}
