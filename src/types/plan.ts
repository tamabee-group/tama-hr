// Response types cho Plan API

/**
 * Thông tin feature của plan
 */
export interface PlanFeatureResponse {
  id: number;
  featureVi: string;
  featureEn: string;
  featureJa: string;
  sortOrder: number;
  isHighlighted: boolean;
}

/**
 * Thông tin gói dịch vụ
 */
export interface PlanResponse {
  id: number;
  nameVi: string;
  nameEn: string;
  nameJa: string;
  descriptionVi: string;
  descriptionEn: string;
  descriptionJa: string;
  monthlyPrice: number;
  maxEmployees: number;
  isActive: boolean;
  features: PlanFeatureResponse[];
}

// Request types cho Plan API

/**
 * Request tạo feature cho plan
 */
export interface PlanFeatureCreateRequest {
  featureVi: string;
  featureEn: string;
  featureJa: string;
  sortOrder: number;
  isHighlighted: boolean;
}

/**
 * Request tạo plan mới
 */
export interface PlanCreateRequest {
  nameVi: string;
  nameEn: string;
  nameJa: string;
  descriptionVi: string;
  descriptionEn: string;
  descriptionJa: string;
  monthlyPrice: number;
  maxEmployees: number;
  isActive: boolean;
  features: PlanFeatureCreateRequest[];
}

/**
 * Request cập nhật plan
 */
export interface PlanUpdateRequest {
  nameVi?: string;
  nameEn?: string;
  nameJa?: string;
  descriptionVi?: string;
  descriptionEn?: string;
  descriptionJa?: string;
  monthlyPrice?: number;
  maxEmployees?: number;
  isActive?: boolean;
  features?: PlanFeatureCreateRequest[];
}

// Helper type để lấy content theo locale
export type LocaleKey = "vi" | "en" | "ja";

/**
 * Helper function để lấy name theo locale
 */
export const getPlanName = (plan: PlanResponse, locale: LocaleKey): string => {
  const nameMap: Record<LocaleKey, string> = {
    vi: plan.nameVi,
    en: plan.nameEn,
    ja: plan.nameJa,
  };
  return nameMap[locale] || plan.nameVi;
};

/**
 * Helper function để lấy description theo locale
 */
export const getPlanDescription = (
  plan: PlanResponse,
  locale: LocaleKey,
): string => {
  const descMap: Record<LocaleKey, string> = {
    vi: plan.descriptionVi,
    en: plan.descriptionEn,
    ja: plan.descriptionJa,
  };
  return descMap[locale] || plan.descriptionVi;
};

/**
 * Helper function để lấy feature text theo locale
 */
export const getFeatureText = (
  feature: PlanFeatureResponse,
  locale: LocaleKey,
): string => {
  const featureMap: Record<LocaleKey, string> = {
    vi: feature.featureVi,
    en: feature.featureEn,
    ja: feature.featureJa,
  };
  return featureMap[locale] || feature.featureVi;
};

// ============================================
// Plan Features Context Types
// ============================================

/**
 * Feature được bật/tắt theo gói dịch vụ
 * Dùng cho dynamic sidebar và route protection
 */
export interface PlanFeature {
  code: string; // "ATTENDANCE", "PAYROLL", "LEAVE", etc.
  enabled: boolean;
}

/**
 * Response từ API /api/plans/{planId}/features
 */
export interface PlanFeaturesResponse {
  planId: number;
  planName: string;
  features: PlanFeature[];
}

/**
 * Context type cho PlanFeatures
 */
export interface PlanFeaturesContextType {
  features: PlanFeature[];
  isLoading: boolean;
  hasFeature: (code: string) => boolean;
  refresh: () => Promise<void>;
}
