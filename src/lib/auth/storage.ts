import { User } from "@/types/user";
import { STORAGE_KEYS } from "@/lib/constants";

/**
 * Lưu thông tin user vào localStorage
 * @client-only - Chỉ sử dụng được ở client side
 */
export function saveCurrentUser(user: User): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

/**
 * Lấy thông tin user từ localStorage
 * @client-only - Chỉ sử dụng được ở client side
 */
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!data) return null;
  try {
    return JSON.parse(data) as User;
  } catch {
    return null;
  }
}

/**
 * Xóa thông tin user khỏi localStorage
 * @client-only - Chỉ sử dụng được ở client side
 */
export function removeCurrentUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

/**
 * Đánh dấu đã có session (khi login thành công)
 * Dùng để biết có refreshToken hay không (vì refreshToken là httpOnly)
 * @client-only - Chỉ sử dụng được ở client side
 */
export function setHasSession(value: boolean): void {
  if (typeof window === "undefined") return;
  if (value) {
    localStorage.setItem(STORAGE_KEYS.HAS_SESSION, "true");
  } else {
    localStorage.removeItem(STORAGE_KEYS.HAS_SESSION);
  }
}

/**
 * Kiểm tra có session flag không
 * @client-only - Chỉ sử dụng được ở client side
 */
export function getHasSession(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEYS.HAS_SESSION) === "true";
}
