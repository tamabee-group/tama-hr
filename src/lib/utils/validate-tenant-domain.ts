/**
 * Kết quả validation tenant domain
 */
export interface TenantDomainValidationResult {
  valid: boolean;
  errorCode?: "TOO_SHORT" | "TOO_LONG" | "INVALID_CHARS" | "INVALID_HYPHEN";
}

/**
 * Validate tenant domain format
 * - Chỉ chứa lowercase letters, numbers, hyphens
 * - Độ dài 3-30 ký tự
 * - Không bắt đầu hoặc kết thúc bằng hyphen
 */
export function validateTenantDomain(
  domain: string,
): TenantDomainValidationResult {
  // Kiểm tra độ dài tối thiểu
  if (domain.length < 3) {
    return { valid: false, errorCode: "TOO_SHORT" };
  }

  // Kiểm tra độ dài tối đa
  if (domain.length > 30) {
    return { valid: false, errorCode: "TOO_LONG" };
  }

  // Kiểm tra ký tự hợp lệ (lowercase, numbers, hyphens)
  if (!/^[a-z0-9-]+$/.test(domain)) {
    return { valid: false, errorCode: "INVALID_CHARS" };
  }

  // Kiểm tra không bắt đầu hoặc kết thúc bằng hyphen
  if (domain.startsWith("-") || domain.endsWith("-")) {
    return { valid: false, errorCode: "INVALID_HYPHEN" };
  }

  return { valid: true };
}
