import { LOCALES, FALLBACK_LOCALE } from "@/lib/constants";

/**
 * Lấy locale từ cookie NEXT_LOCALE (client side)
 * @client-only - Chỉ sử dụng được ở client side
 */
export function getLocaleFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * Parse Accept-Language header và trả về locale phù hợp
 * @client-server - Có thể sử dụng ở cả client và server side
 */
export function parseAcceptLanguage(acceptLanguage: string | null): string {
  if (!acceptLanguage) return FALLBACK_LOCALE;

  const languages = acceptLanguage.split(",").map((lang) => {
    const [code] = lang.trim().split(";");
    return code.split("-")[0].toLowerCase();
  });

  for (const lang of languages) {
    if (LOCALES.includes(lang as (typeof LOCALES)[number])) {
      return lang;
    }
  }

  return FALLBACK_LOCALE;
}
