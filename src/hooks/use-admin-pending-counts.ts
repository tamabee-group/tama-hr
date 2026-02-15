"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  getAdminPendingCounts,
  type AdminPendingCounts,
} from "@/lib/apis/dashboard-api";
import { subscribeToNotificationEvents } from "@/hooks/use-notifications";

// ==================== Global State Store ====================

let store: AdminPendingCounts = {
  pendingDeposits: 0,
  openFeedbacks: 0,
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return store;
}

async function fetchAndUpdateCounts() {
  try {
    const data = await getAdminPendingCounts();
    store = data;
    emitChange();
  } catch {
    // Bỏ qua lỗi, giữ giá trị cũ
  }
}

/**
 * Gọi hàm này để refresh admin pending counts từ bất kỳ đâu
 * Dùng sau khi xử lý deposit/feedback để cập nhật sidebar badge
 */
export function refreshAdminPendingCounts() {
  fetchAndUpdateCounts();
}

/**
 * Hook lấy số yêu cầu chờ xử lý cho admin/support sidebar badges.
 * Tự động cập nhật khi có notification WALLET hoặc FEEDBACK.
 */
export function useAdminPendingCounts() {
  const counts = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    fetchAndUpdateCounts();
  }, []);

  useEffect(() => {
    const unsubWallet = subscribeToNotificationEvents("WALLET", () => {
      fetchAndUpdateCounts();
    });
    const unsubFeedback = subscribeToNotificationEvents("FEEDBACK", () => {
      fetchAndUpdateCounts();
    });
    return () => {
      unsubWallet();
      unsubFeedback();
    };
  }, []);

  return counts;
}
