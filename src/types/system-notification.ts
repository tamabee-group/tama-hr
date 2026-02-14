// Types cho System Notification (Admin)
// Chỉ chứa enum values, translations được quản lý trong message files

// ============================================
// Target Audience Enums
// ============================================

export const TARGET_AUDIENCES = ["COMPANY_ADMINS", "ALL_USERS"] as const;

export type TargetAudience = (typeof TARGET_AUDIENCES)[number];

// ============================================
// System Notification Interfaces
// ============================================

/**
 * Thông tin system notification (danh sách + chi tiết)
 */
export interface SystemNotification {
  id: number;
  titleVi: string;
  titleEn: string;
  titleJa: string;
  contentVi: string;
  contentEn: string;
  contentJa: string;
  targetAudience: TargetAudience;
  createdByName: string | null;
  createdAt: string;
}

/**
 * Request tạo system notification mới
 */
export interface CreateSystemNotificationRequest {
  titleVi: string;
  titleEn: string;
  titleJa: string;
  contentVi: string;
  contentEn: string;
  contentJa: string;
  targetAudience: TargetAudience;
}
