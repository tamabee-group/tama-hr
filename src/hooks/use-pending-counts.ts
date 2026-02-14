"use client";

import { useEffect, useSyncExternalStore } from "react";
import { getPendingCounts, type PendingCounts } from "@/lib/apis/dashboard-api";
import { subscribeToNotificationEvents } from "@/hooks/use-notifications";

// ==================== Global State Store ====================

let store: PendingCounts = {
  pendingAdjustments: 0,
  pendingLeaves: 0,
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
    const data = await getPendingCounts();
    store = data;
    emitChange();
  } catch {
    // Bỏ qua lỗi, giữ giá trị cũ
  }
}

/**
 * Gọi hàm này để refresh pending counts từ bất kỳ đâu
 * Dùng sau khi approve/reject để cập nhật sidebar badge
 */
export function refreshPendingCounts() {
  fetchAndUpdateCounts();
}

/**
 * Hook lấy số yêu cầu chờ duyệt cho sidebar badges
 * Tự động cập nhật khi có notification ADJUSTMENT hoặc LEAVE
 * Dùng global state để share giữa sidebar và các trang
 */
export function usePendingCounts() {
  const counts = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // Fetch lần đầu
  useEffect(() => {
    fetchAndUpdateCounts();
  }, []);

  // Cập nhật real-time khi có notification liên quan
  useEffect(() => {
    const unsubAdj = subscribeToNotificationEvents("ADJUSTMENT", () => {
      fetchAndUpdateCounts();
    });
    const unsubLeave = subscribeToNotificationEvents("LEAVE", () => {
      fetchAndUpdateCounts();
    });
    return () => {
      unsubAdj();
      unsubLeave();
    };
  }, []);

  return counts;
}
