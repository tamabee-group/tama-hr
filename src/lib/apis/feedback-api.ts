import { apiClient } from "@/lib/utils/fetch-client";
import type {
  Feedback,
  FeedbackDetail,
  FeedbackReply,
  FeedbackStatus,
  FeedbackType,
} from "@/types/feedback";
import {
  PaginatedResponse,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from "@/types/api";

/**
 * Feedback API functions — User side
 * @client-only - Chỉ sử dụng được ở client side
 */

// ============================================
// User Feedback APIs
// ============================================

/**
 * Gửi feedback mới (multipart form với ảnh đính kèm)
 * @client-only
 */
export async function createFeedback(
  feedback: { type: string; title: string; description: string },
  files?: File[],
): Promise<Feedback> {
  const formData = new FormData();

  // Thêm feedback JSON dưới dạng Blob
  formData.append(
    "feedback",
    new Blob([JSON.stringify(feedback)], { type: "application/json" }),
  );

  // Thêm files nếu có
  if (files && files.length > 0) {
    files.forEach((file) => {
      formData.append("files", file);
    });
  }

  return apiClient.upload<Feedback>("/api/users/me/feedbacks", formData);
}

/**
 * Lấy danh sách feedback của user hiện tại (phân trang)
 * @client-only
 */
export async function getMyFeedbacks(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResponse<Feedback>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  return apiClient.get<PaginatedResponse<Feedback>>(
    `/api/users/me/feedbacks?${params.toString()}`,
  );
}

/**
 * Lấy chi tiết feedback + replies của user
 * @client-only
 */
export async function getMyFeedbackDetail(id: number): Promise<FeedbackDetail> {
  return apiClient.get<FeedbackDetail>(`/api/users/me/feedbacks/${id}`);
}

/**
 * Gửi tin nhắn cho feedback (user reply, chat-style, có thể kèm ảnh)
 * @client-only
 */
export async function replyMyFeedback(
  feedbackId: number,
  content: string,
  files?: File[],
): Promise<FeedbackReply> {
  const formData = new FormData();
  formData.append(
    "reply",
    new Blob([JSON.stringify({ content })], { type: "application/json" }),
  );
  if (files && files.length > 0) {
    files.forEach((file) => formData.append("files", file));
  }
  return apiClient.upload<FeedbackReply>(
    `/api/users/me/feedbacks/${feedbackId}/replies`,
    formData,
  );
}

// ============================================
// Feedback API object
// ============================================

// ============================================
// Admin Feedback APIs
// ============================================

/**
 * Lấy danh sách feedbacks cho admin (phân trang, lọc theo status/type)
 * @client-only
 */
export async function getAdminFeedbacks(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_PAGE_SIZE,
  status?: FeedbackStatus,
  type?: FeedbackType,
): Promise<PaginatedResponse<Feedback>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());
  if (status) params.append("status", status);
  if (type) params.append("type", type);

  return apiClient.get<PaginatedResponse<Feedback>>(
    `/api/admin/feedbacks?${params.toString()}`,
  );
}

/**
 * Lấy chi tiết feedback + replies cho admin
 * @client-only
 */
export async function getAdminFeedbackDetail(
  id: number,
): Promise<FeedbackDetail> {
  return apiClient.get<FeedbackDetail>(`/api/admin/feedbacks/${id}`);
}

/**
 * Gửi phản hồi cho feedback (có thể kèm ảnh)
 * @client-only
 */
export async function replyFeedback(
  feedbackId: number,
  content: string,
  files?: File[],
): Promise<FeedbackReply> {
  const formData = new FormData();
  formData.append(
    "reply",
    new Blob([JSON.stringify({ content })], { type: "application/json" }),
  );
  if (files && files.length > 0) {
    files.forEach((file) => formData.append("files", file));
  }
  return apiClient.upload<FeedbackReply>(
    `/api/admin/feedbacks/${feedbackId}/replies`,
    formData,
  );
}

/**
 * Cập nhật trạng thái feedback
 * @client-only
 */
export async function updateFeedbackStatus(
  feedbackId: number,
  status: FeedbackStatus,
): Promise<Feedback> {
  return apiClient.put<Feedback>(`/api/admin/feedbacks/${feedbackId}/status`, {
    status,
  });
}

/**
 * Xóa feedback (chỉ admin)
 * @client-only
 */
export async function deleteFeedback(feedbackId: number): Promise<void> {
  return apiClient.delete<void>(`/api/admin/feedbacks/${feedbackId}`);
}

// ============================================
// Feedback API object
// ============================================

export const feedbackApi = {
  createFeedback,
  getMyFeedbacks,
  getMyFeedbackDetail,
  replyMyFeedback,
  getAdminFeedbacks,
  getAdminFeedbackDetail,
  replyFeedback,
  updateFeedbackStatus,
  deleteFeedback,
};
