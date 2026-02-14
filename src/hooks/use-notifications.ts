"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Notification } from "@/types/notification";
import {
  getNotifications,
  getUnreadCount,
  markAsRead as apiMarkAsRead,
  markAllAsRead as apiMarkAllAsRead,
} from "@/lib/apis/notification-api";
import {
  getStompClient,
  subscribeToNotifications,
  isStompConnected,
  disconnectStomp,
} from "@/lib/socket";
import { getAccessTokenFromCookie } from "@/lib/utils/jwt";
import { StompSubscription } from "@stomp/stompjs";

// Số lượng notification hiển thị trong popup
const POPUP_NOTIFICATION_LIMIT = 5;

// ==================== Global State Store ====================
// Sử dụng global state để đảm bảo tất cả instances của hook share cùng data

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
}

let store: NotificationStore = {
  notifications: [],
  unreadCount: 0,
  isLoading: true,
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

function setNotifications(notifications: Notification[]) {
  store = { ...store, notifications };
  emitChange();
}

function setUnreadCount(count: number) {
  store = { ...store, unreadCount: count };
  emitChange();
}

function setIsLoading(isLoading: boolean) {
  store = { ...store, isLoading };
  emitChange();
}

function addNotification(notification: Notification) {
  console.log(
    "[useNotifications] addNotification called, current count:",
    store.unreadCount,
  );
  const updated = [notification, ...store.notifications].slice(
    0,
    POPUP_NOTIFICATION_LIMIT,
  );
  store = {
    ...store,
    notifications: updated,
    unreadCount: store.unreadCount + 1,
  };
  console.log(
    "[useNotifications] Store updated, new count:",
    store.unreadCount,
    "listeners:",
    listeners.size,
  );
  emitChange();

  // Gọi các callbacks đã đăng ký cho notification type này
  notifySubscribers(notification);
}

function markNotificationAsRead(id: number) {
  const notifications = store.notifications.map((n) =>
    n.id === id ? { ...n, isRead: true } : n,
  );
  const unreadCount = Math.max(0, store.unreadCount - 1);
  store = { ...store, notifications, unreadCount };
  emitChange();
}

function markAllNotificationsAsRead() {
  const notifications = store.notifications.map((n) => ({
    ...n,
    isRead: true,
  }));
  store = { ...store, notifications, unreadCount: 0 };
  emitChange();
}

// ==================== Notification Event Subscribers ====================
// Cho phép các page đăng ký callback khi có notification mới

type NotificationCallback = (notification: Notification) => void;

// Map từ notification code prefix đến callbacks
const notificationSubscribers = new Map<string, Set<NotificationCallback>>();

function notifySubscribers(notification: Notification) {
  // Gọi callbacks cho exact code match
  const exactCallbacks = notificationSubscribers.get(notification.code);
  if (exactCallbacks) {
    exactCallbacks.forEach((cb) => cb(notification));
  }

  // Gọi callbacks cho type match (e.g., "LEAVE" matches "LEAVE_SUBMITTED", "LEAVE_APPROVED")
  const typeCallbacks = notificationSubscribers.get(notification.type);
  if (typeCallbacks) {
    typeCallbacks.forEach((cb) => cb(notification));
  }

  // Gọi callbacks cho wildcard "*" (all notifications)
  const allCallbacks = notificationSubscribers.get("*");
  if (allCallbacks) {
    allCallbacks.forEach((cb) => cb(notification));
  }
}

/**
 * Đăng ký callback khi có notification mới
 * @param codeOrType - Notification code (e.g., "LEAVE_SUBMITTED"), type (e.g., "LEAVE"), hoặc "*" cho tất cả
 * @param callback - Function được gọi khi có notification mới
 * @returns Unsubscribe function
 */
export function subscribeToNotificationEvents(
  codeOrType: string,
  callback: NotificationCallback,
): () => void {
  if (!notificationSubscribers.has(codeOrType)) {
    notificationSubscribers.set(codeOrType, new Set());
  }
  notificationSubscribers.get(codeOrType)!.add(callback);

  return () => {
    const callbacks = notificationSubscribers.get(codeOrType);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        notificationSubscribers.delete(codeOrType);
      }
    }
  };
}

// ==================== WebSocket Setup (singleton) ====================

let wsInitialized = false;
let activeSubscription: StompSubscription | null = null;

/**
 * Reset WebSocket và notification state khi logout
 * Gọi từ AuthContext khi user logout hoặc session hết hạn
 */
export function resetNotificationWebSocket(): void {
  disconnectStomp();
  wsInitialized = false;
  activeSubscription = null;
  // Reset store về trạng thái ban đầu
  store = { notifications: [], unreadCount: 0, isLoading: true };
  emitChange();
}

function setupWebSocketOnce(userId: number, token: string) {
  if (wsInitialized) return;
  wsInitialized = true;

  const handleReconnect = () => {
    console.log("[useNotifications] WebSocket reconnected, fetching data...");
    fetchNotificationsData();
  };

  const handleNewNotification = (notification: unknown) => {
    const newNotification = notification as Notification;
    console.log("[useNotifications] Nhận notification mới:", newNotification);
    console.log("[useNotifications] Calling addNotification...");
    addNotification(newNotification);
    console.log("[useNotifications] addNotification completed");
  };

  try {
    getStompClient(token, handleReconnect);

    const checkAndSubscribe = () => {
      if (activeSubscription) return;

      if (isStompConnected()) {
        activeSubscription = subscribeToNotifications(
          userId,
          handleNewNotification,
        );
        console.log("[useNotifications] WebSocket subscribed");
      } else {
        setTimeout(checkAndSubscribe, 500);
      }
    };

    checkAndSubscribe();
  } catch (error) {
    console.error("[useNotifications] Lỗi setup WebSocket:", error);
    wsInitialized = false;
  }
}

// ==================== Data Fetching ====================

let fetchPromise: Promise<void> | null = null;

async function fetchNotificationsData() {
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    try {
      setIsLoading(true);
      const [notificationsResponse, count] = await Promise.all([
        getNotifications(0, POPUP_NOTIFICATION_LIMIT),
        getUnreadCount(),
      ]);
      setNotifications(notificationsResponse.content);
      setUnreadCount(count);
    } catch (error) {
      console.error("[useNotifications] Lỗi fetch data:", error);
    } finally {
      setIsLoading(false);
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

/**
 * Return type của useNotifications hook
 */
export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isConnected: boolean;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook quản lý notifications với real-time updates qua WebSocket
 * Sử dụng global state để đảm bảo tất cả instances share cùng data
 * @client-only
 */
export function useNotifications(): UseNotificationsReturn {
  // Subscribe to global store
  const storeState = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // Local state for connection status
  const [isConnected, setIsConnected] = useState(false);

  // Auth context
  const { user, status } = useAuth();

  // Effect: Fetch initial data và setup WebSocket
  useEffect(() => {
    if (status === "authenticated" && user) {
      // Fetch data
      fetchNotificationsData();

      // Setup WebSocket
      const token = getAccessTokenFromCookie();
      if (token) {
        setupWebSocketOnce(user.id, token);
      }
    }
  }, [status, user]);

  // Effect: Check connection status periodically
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(isStompConnected());
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Đánh dấu một notification là đã đọc
   */
  const markAsRead = useCallback(
    async (id: number) => {
      // Optimistic update
      const prevNotifications = [...storeState.notifications];
      const prevUnreadCount = storeState.unreadCount;
      markNotificationAsRead(id);

      try {
        await apiMarkAsRead(id);
      } catch (error) {
        console.error("[useNotifications] Lỗi markAsRead:", error);
        // Rollback
        setNotifications(prevNotifications);
        setUnreadCount(prevUnreadCount);
      }
    },
    [storeState.notifications, storeState.unreadCount],
  );

  /**
   * Đánh dấu tất cả notifications là đã đọc
   */
  const markAllAsRead = useCallback(async () => {
    const prevNotifications = [...storeState.notifications];
    const prevUnreadCount = storeState.unreadCount;
    markAllNotificationsAsRead();

    try {
      await apiMarkAllAsRead();
    } catch (error) {
      console.error("[useNotifications] Lỗi markAllAsRead:", error);
      // Rollback
      setNotifications(prevNotifications);
      setUnreadCount(prevUnreadCount);
    }
  }, [storeState.notifications, storeState.unreadCount]);

  /**
   * Refetch data từ API
   */
  const refetch = useCallback(async () => {
    await fetchNotificationsData();
  }, []);

  return {
    notifications: storeState.notifications,
    unreadCount: storeState.unreadCount,
    isLoading: storeState.isLoading,
    isConnected,
    markAsRead,
    markAllAsRead,
    refetch,
  };
}
