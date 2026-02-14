// Types cho hệ thống thông báo real-time
// Chỉ chứa enum values, translations được quản lý trong message files

// ============================================
// Notification Type Enums (Loại thông báo)
// ============================================

export const NOTIFICATION_TYPES = [
  "WELCOME",
  "PAYROLL",
  "WALLET",
  "LEAVE",
  "ADJUSTMENT",
  "SYSTEM",
  "FEEDBACK",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

// Màu sắc cho notification type badge
export const NOTIFICATION_TYPE_COLORS: Record<
  NotificationType,
  "info" | "success" | "warning" | "secondary"
> = {
  WELCOME: "info",
  PAYROLL: "success",
  WALLET: "warning",
  LEAVE: "info",
  ADJUSTMENT: "warning",
  SYSTEM: "secondary",
  FEEDBACK: "info",
};

// ============================================
// Notification Interface
// ============================================

/**
 * Thông tin thông báo
 */
export interface Notification {
  id: number;
  code: string;
  params: Record<string, string | number>;
  targetUrl: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  title?: string;
  content?: string;
  systemNotificationId?: number;
}

// ============================================
// Notification API Response Types
// ============================================

/**
 * Response cho API lấy số lượng thông báo chưa đọc
 */
export interface UnreadCountResponse {
  count: number;
}
