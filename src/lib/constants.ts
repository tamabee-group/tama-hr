// API URL
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

// Các locale được hỗ trợ
export const LOCALES = ["vi", "en", "ja"] as const;
export const FALLBACK_LOCALE = "en";

// Các route yêu cầu đăng nhập
export const PROTECTED_ROUTES = [
  "/dashboard",
  "/profile",
  "/settings",
  "/admin",
  "/support",
];

// Các route chỉ dành cho guest (chưa đăng nhập)
export const GUEST_ONLY_ROUTES = ["/login", "/register", "/forgot-password"];

// LocalStorage keys
export const STORAGE_KEYS = {
  CURRENT_USER: "currentUser",
  HAS_SESSION: "hasSession", // Flag để biết có refreshToken (vì httpOnly không đọc được)
} as const;
