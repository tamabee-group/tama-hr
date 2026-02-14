import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// STOMP client singleton
let stompClient: Client | null = null;

// Trạng thái kết nối
let isConnected = false;

// Callback khi reconnect thành công
let onReconnectCallback: (() => void) | null = null;

// Track active subscription để tránh duplicate
let activeSubscription: StompSubscription | null = null;

// Lưu thông tin subscription để re-subscribe khi reconnect
let pendingSubscription: {
  userId: number;
  onMessage: (notification: unknown) => void;
} | null = null;

// Lưu token để reconnect
let savedToken: string | null = null;

// Cấu hình reconnect - tự quản lý thay vì dùng built-in của @stomp/stompjs
const INITIAL_RECONNECT_DELAY = 2000;
const MAX_RECONNECT_DELAY = 60000;
const RECONNECT_MULTIPLIER = 2;
const MAX_CONSECUTIVE_FAILURES = 5;

let consecutiveFailures = 0;
let reconnectStopped = false;
let currentDelay = INITIAL_RECONNECT_DELAY;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Xóa timer reconnect nếu có
 */
function clearReconnectTimer(): void {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

/**
 * Schedule reconnect với exponential backoff
 * Tự quản lý reconnect thay vì dùng built-in (để kiểm soát hoàn toàn)
 */
function scheduleReconnect(): void {
  clearReconnectTimer();

  if (reconnectStopped || !savedToken) return;

  consecutiveFailures++;

  if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
    reconnectStopped = true;
    console.warn(
      `[STOMP] Đã fail ${consecutiveFailures} lần liên tiếp, dừng reconnect.`,
    );
    return;
  }

  currentDelay = Math.min(
    currentDelay * RECONNECT_MULTIPLIER,
    MAX_RECONNECT_DELAY,
  );

  console.log(
    `[STOMP] Reconnect sau ${currentDelay / 1000} giây... (lần ${consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES})`,
  );

  reconnectTimer = setTimeout(() => {
    if (reconnectStopped || !savedToken) return;
    // Tạo client mới (client cũ đã deactivate)
    createAndActivateClient(savedToken);
  }, currentDelay);
}

/**
 * Tạo và kích hoạt STOMP client
 * reconnectDelay = 0 để tắt built-in reconnect, tự quản lý bằng scheduleReconnect
 */
function createAndActivateClient(token: string): void {
  // Cleanup client cũ nếu có
  if (stompClient) {
    try {
      stompClient.deactivate();
    } catch {
      // Bỏ qua lỗi
    }
    stompClient = null;
  }

  stompClient = new Client({
    webSocketFactory: () => {
      const wsUrl =
        process.env.NEXT_PUBLIC_API_URL || "https://api-hr.tamabee.local";
      return new SockJS(`${wsUrl}/ws/notifications`);
    },

    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },

    // TẮT built-in reconnect — tự quản lý
    reconnectDelay: 0,

    heartbeatIncoming: 30000,
    heartbeatOutgoing: 30000,

    onConnect: () => {
      console.log("[STOMP] Kết nối thành công");
      const wasReconnect = consecutiveFailures > 0;

      isConnected = true;
      consecutiveFailures = 0;
      currentDelay = INITIAL_RECONNECT_DELAY;

      // Re-subscribe nếu có pending subscription
      if (pendingSubscription) {
        activeSubscription = null;
        subscribeToNotifications(
          pendingSubscription.userId,
          pendingSubscription.onMessage,
        );
      }

      // Nếu đây là reconnect, gọi callback để fetch lại data
      if (wasReconnect && onReconnectCallback) {
        console.log("[STOMP] Reconnect thành công, đang fetch lại data...");
        onReconnectCallback();
      }
    },

    onDisconnect: () => {
      isConnected = false;
      activeSubscription = null;
      // Schedule reconnect khi mất kết nối (nếu chưa bị dừng)
      if (!reconnectStopped) {
        scheduleReconnect();
      }
    },

    onStompError: (frame) => {
      console.error("[STOMP] Lỗi STOMP:", frame.headers["message"]);
    },

    onWebSocketError: () => {
      isConnected = false;
      activeSubscription = null;
    },

    onWebSocketClose: () => {
      isConnected = false;
      activeSubscription = null;
      // Schedule reconnect khi WebSocket đóng
      if (!reconnectStopped) {
        scheduleReconnect();
      }
    },
  });

  stompClient.activate();
}

/**
 * Lấy hoặc tạo STOMP client
 */
export function getStompClient(
  token: string,
  onReconnect?: () => void,
): Client {
  if (onReconnect) {
    onReconnectCallback = onReconnect;
  }

  savedToken = token;

  if (stompClient && stompClient.active) {
    return stompClient;
  }

  // Reset trạng thái
  consecutiveFailures = 0;
  reconnectStopped = false;
  currentDelay = INITIAL_RECONNECT_DELAY;
  clearReconnectTimer();

  createAndActivateClient(token);
  return stompClient!;
}

/**
 * Subscribe vào topic nhận notification
 */
export function subscribeToNotifications(
  userId: number,
  onMessage: (notification: unknown) => void,
): StompSubscription | null {
  pendingSubscription = { userId, onMessage };

  if (!stompClient || !stompClient.active) {
    return null;
  }

  if (activeSubscription) {
    try {
      activeSubscription.unsubscribe();
    } catch {
      // Bỏ qua lỗi
    }
    activeSubscription = null;
  }

  const subscription = stompClient.subscribe(
    "/user/queue/notifications",
    (message: IMessage) => {
      try {
        const notification = JSON.parse(message.body);
        onMessage(notification);
      } catch (error) {
        console.error("[STOMP] Lỗi parse notification:", error);
      }
    },
  );

  activeSubscription = subscription;
  return subscription;
}

/**
 * Ngắt kết nối STOMP client và reset toàn bộ state
 */
export function disconnectStomp(): void {
  reconnectStopped = true;
  clearReconnectTimer();
  pendingSubscription = null;
  savedToken = null;

  if (activeSubscription) {
    try {
      activeSubscription.unsubscribe();
    } catch {
      // Bỏ qua lỗi
    }
    activeSubscription = null;
  }

  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }

  isConnected = false;
  consecutiveFailures = 0;
  currentDelay = INITIAL_RECONNECT_DELAY;
  onReconnectCallback = null;
  console.log("[STOMP] Đã ngắt kết nối và cleanup");
}

/**
 * Thử kết nối lại sau khi đã bị dừng
 */
export function reconnectStomp(token: string, onReconnect?: () => void): void {
  disconnectStomp();
  getStompClient(token, onReconnect);
}

/**
 * Kiểm tra trạng thái kết nối
 */
export function isStompConnected(): boolean {
  return isConnected && stompClient !== null && stompClient.active;
}

/**
 * Kiểm tra reconnect đã bị dừng chưa
 */
export function isReconnectStopped(): boolean {
  return reconnectStopped;
}

/**
 * Cập nhật JWT token
 */
export function updateStompToken(newToken: string): void {
  savedToken = newToken;
  if (stompClient) {
    stompClient.connectHeaders = {
      Authorization: `Bearer ${newToken}`,
    };
  }
}
