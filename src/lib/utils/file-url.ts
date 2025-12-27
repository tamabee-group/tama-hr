const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
const FALLBACK_AVATAR = "/images/avatar-placeholder.png";

/**
 * Nối host server với path của file (avatar, document, etc.)
 * @param path - Đường dẫn tương đối từ server (vd: /uploads/avatar/ABC123/uuid.webp)
 * @returns URL đầy đủ (vd: http://localhost:8081/uploads/avatar/ABC123/uuid.webp)
 */
export function getFileUrl(path: string | null | undefined): string {
  if (!path) return FALLBACK_AVATAR;
  // Đã là URL đầy đủ (http/https) hoặc blob URL (preview sau khi crop)
  if (path.startsWith("http") || path.startsWith("blob:")) return path;
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
