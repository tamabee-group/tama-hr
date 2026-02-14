import { apiClient } from "@/lib/utils/fetch-client";
import type {
  SystemNotification,
  CreateSystemNotificationRequest,
} from "@/types/system-notification";
import {
  PaginatedResponse,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from "@/types/api";

/**
 * System Notification API — Admin CRUD + lấy nội dung đa ngôn ngữ
 * @client-only
 */

// Giữ lại interface cũ cho backward compatibility
export type SystemNotificationDetail = SystemNotification;

/**
 * Tạo system notification mới và gửi đến target audience
 * @client-only
 */
export async function createSystemNotification(
  request: CreateSystemNotificationRequest,
): Promise<SystemNotification> {
  return apiClient.post<SystemNotification>(
    "/api/admin/system-notifications",
    request,
  );
}

/**
 * Lấy danh sách system notifications (phân trang)
 * @client-only
 */
export async function getSystemNotifications(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResponse<SystemNotification>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  return apiClient.get<PaginatedResponse<SystemNotification>>(
    `/api/admin/system-notifications?${params.toString()}`,
  );
}

/**
 * Lấy chi tiết system notification theo ID (nội dung 3 ngôn ngữ)
 * @client-only
 */
export async function getSystemNotificationById(
  id: number,
): Promise<SystemNotification> {
  return apiClient.get<SystemNotification>(
    `/api/admin/system-notifications/${id}`,
  );
}

export const systemNotificationApi = {
  create: createSystemNotification,
  getAll: getSystemNotifications,
  getById: getSystemNotificationById,
};
