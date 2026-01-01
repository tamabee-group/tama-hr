"use client";

import { useState, useEffect } from "react";
import { depositApi } from "@/lib/apis/deposit-api";
import { useAuth } from "@/hooks/use-auth";
import { isTamabeeStaff } from "@/types/permissions";

/**
 * Hook để lấy số lượng deposit requests đang chờ duyệt
 * Chỉ gọi API khi user có quyền (Admin/Manager Tamabee)
 * @client-only - Chỉ sử dụng được ở client side
 */
export function usePendingDepositsCount() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user, status } = useAuth();

  // Kiểm tra user có quyền xem deposits không
  const hasPermission = user && isTamabeeStaff(user.role);

  useEffect(() => {
    // Không gọi API nếu đang loading auth hoặc không có quyền
    if (status === "loading") return;
    if (!hasPermission) {
      setLoading(false);
      setCount(0);
      return;
    }

    const fetchCount = async () => {
      try {
        const response = await depositApi.getAll({ status: "PENDING" }, 0, 1);
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
  }, [hasPermission, status]);

  return { count, loading };
}
