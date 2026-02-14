import { apiClient } from "@/lib/utils/fetch-client";
import { Notification } from "@/types/notification";
import {
  PaginatedResponse,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from "@/types/api";

/**
 * Notification API functions
 * @client-only - Chỉ sử dụng được ở client side
 */

// ============================================
// User Notification APIs - Dành cho tất cả authenticated users
// ============================================

/**
 * Lấy danh sách thông báo của user hiện tại (phân trang)
 * @client-only
 */
export async function getNotifications(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResponse<Notification>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  return apiClient.get<PaginatedResponse<Notification>>(
    `/api/users/me/notifications?${params.toString()}`,
  );
}

/**
 * Lấy số lượng thông báo chưa đọc
 * @client-only
 */
export async function getUnreadCount(): Promise<number> {
  return apiClient.get<number>("/api/users/me/notifications/unread-count");
}

/**
 * Lấy chi tiết một thông báo theo ID
 * @client-only
 */
export async function getNotificationById(id: number): Promise<Notification> {
  return apiClient.get<Notification>(`/api/users/me/notifications/${id}`);
}

/**
 * Đánh dấu một thông báo là đã đọc
 * @client-only
 */
export async function markAsRead(id: number): Promise<void> {
  return apiClient.put<void>(`/api/users/me/notifications/${id}/read`);
}

/**
 * Đánh dấu tất cả thông báo là đã đọc
 * @client-only
 */
export async function markAllAsRead(): Promise<void> {
  return apiClient.put<void>("/api/users/me/notifications/read-all");
}

// ============================================
// Notification API object - Export tất cả functions
// ============================================

export const notificationApi = {
  getNotifications,
  getNotificationById,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
