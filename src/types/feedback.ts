// Types cho hệ thống Feedback & Support
// Chỉ chứa enum values, translations được quản lý trong message files

// ============================================
// Feedback Type Enums
// ============================================

export const FEEDBACK_TYPES = [
  "BUG_REPORT",
  "FEATURE_REQUEST",
  "GENERAL_FEEDBACK",
  "SUPPORT_REQUEST",
] as const;

export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

// ============================================
// Feedback Status Enums
// ============================================

export const FEEDBACK_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
] as const;

export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

// Màu sắc cho feedback status badge
export const FEEDBACK_STATUS_COLORS: Record<
  FeedbackStatus,
  "info" | "warning" | "success" | "secondary"
> = {
  OPEN: "info",
  IN_PROGRESS: "warning",
  RESOLVED: "success",
  CLOSED: "secondary",
};

// Màu sắc cho feedback type badge
export const FEEDBACK_TYPE_COLORS: Record<
  FeedbackType,
  "destructive" | "info" | "secondary" | "warning"
> = {
  BUG_REPORT: "destructive",
  FEATURE_REQUEST: "info",
  GENERAL_FEEDBACK: "secondary",
  SUPPORT_REQUEST: "warning",
};

// ============================================
// Feedback Interfaces
// ============================================

/**
 * Thông tin feedback (danh sách)
 */
export interface Feedback {
  id: number;
  userId: number;
  tenantDomain: string;
  userName: string;
  userEmail: string;
  companyName: string | null;
  type: FeedbackType;
  title: string;
  description: string;
  attachmentUrls: string[];
  status: FeedbackStatus;
  createdAt: string;
}

/**
 * Phản hồi từ nhân viên Tamabee
 */
export interface FeedbackReply {
  id: number;
  feedbackId: number;
  repliedByUserId: number;
  repliedByName: string;
  content: string;
  createdAt: string;
}

/**
 * Chi tiết feedback bao gồm danh sách phản hồi
 */
export interface FeedbackDetail extends Feedback {
  replies: FeedbackReply[];
}
