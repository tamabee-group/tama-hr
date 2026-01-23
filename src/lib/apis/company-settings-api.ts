import { apiClient } from "@/lib/utils/fetch-client";
import {
  CompanySettings,
  AttendanceConfig,
  PayrollConfig,
  OvertimeConfig,
  BreakConfig,
  AllowanceConfig,
  DeductionConfig,
  LegalOvertimeMinimums,
} from "@/types/attendance-config";

/**
 * Company Settings API functions
 * Quản lý cấu hình chấm công và tính lương của công ty
 * @client-only - Chỉ sử dụng được ở client side
 */

// ============================================
// Get Settings
// ============================================

/**
 * Lấy tất cả cấu hình của công ty
 * @client-only
 */
export async function getSettings(): Promise<CompanySettings> {
  return apiClient.get<CompanySettings>("/api/company/settings");
}

/**
 * Lấy cấu hình chấm công
 * @client-only
 */
export async function getAttendanceConfig(): Promise<AttendanceConfig> {
  return apiClient.get<AttendanceConfig>("/api/company/settings/attendance");
}

/**
 * Lấy cấu hình lương
 * @client-only
 */
export async function getPayrollConfig(): Promise<PayrollConfig> {
  return apiClient.get<PayrollConfig>("/api/company/settings/payroll");
}

/**
 * Lấy cấu hình tăng ca
 * @client-only
 */
export async function getOvertimeConfig(): Promise<OvertimeConfig> {
  return apiClient.get<OvertimeConfig>("/api/company/settings/overtime");
}

/**
 * Lấy giá trị tối thiểu theo pháp luật cho hệ số tăng ca
 * Trả về các giá trị tối thiểu cho từng locale (ja, vi, default)
 * @client-only
 */
export async function getLegalOvertimeMinimums(): Promise<LegalOvertimeMinimums> {
  return apiClient.get<LegalOvertimeMinimums>(
    "/api/company/settings/overtime/legal-minimums",
  );
}

/**
 * Lấy cấu hình giờ giải lao
 * @client-only
 */
export async function getBreakConfig(): Promise<BreakConfig> {
  return apiClient.get<BreakConfig>("/api/company/settings/break");
}

// ============================================
// Update Settings
// ============================================

/**
 * Cập nhật cấu hình chấm công
 * @client-only
 */
export async function updateAttendanceConfig(
  config: AttendanceConfig,
): Promise<AttendanceConfig> {
  return apiClient.put<AttendanceConfig>(
    "/api/company/settings/attendance",
    config,
  );
}

/**
 * Cập nhật cấu hình lương
 * @client-only
 */
export async function updatePayrollConfig(
  config: PayrollConfig,
): Promise<PayrollConfig> {
  return apiClient.put<PayrollConfig>("/api/company/settings/payroll", config);
}

/**
 * Cập nhật cấu hình tăng ca
 * @client-only
 */
export async function updateOvertimeConfig(
  config: OvertimeConfig,
): Promise<OvertimeConfig> {
  return apiClient.put<OvertimeConfig>(
    "/api/company/settings/overtime",
    config,
  );
}

/**
 * Cập nhật cấu hình giờ giải lao
 * @client-only
 */
export async function updateBreakConfig(config: BreakConfig): Promise<void> {
  await apiClient.put<void>("/api/company/settings/break", config);
}

/**
 * Cập nhật cấu hình phụ cấp
 * @client-only
 */
export async function updateAllowanceConfig(
  config: AllowanceConfig,
): Promise<AllowanceConfig> {
  return apiClient.put<AllowanceConfig>(
    "/api/company/settings/allowance",
    config,
  );
}

/**
 * Cập nhật cấu hình khấu trừ
 * @client-only
 */
export async function updateDeductionConfig(
  config: DeductionConfig,
): Promise<DeductionConfig> {
  return apiClient.put<DeductionConfig>(
    "/api/company/settings/deduction",
    config,
  );
}

// ============================================
// Export API object
// ============================================

export const companySettingsApi = {
  // Settings
  getSettings,
  getAttendanceConfig,
  getPayrollConfig,
  getOvertimeConfig,
  getLegalOvertimeMinimums,
  getBreakConfig,
  updateAttendanceConfig,
  updatePayrollConfig,
  updateOvertimeConfig,
  updateBreakConfig,
  updateAllowanceConfig,
  updateDeductionConfig,
};
