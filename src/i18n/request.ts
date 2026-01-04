import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { NAMESPACES } from "./namespaces";

/**
 * Load tất cả namespace files cho một locale và merge thành một object
 */
async function loadMessages(locale: string): Promise<Record<string, unknown>> {
  const messages: Record<string, unknown> = {};

  for (const namespace of NAMESPACES) {
    try {
      // Load namespace file cho locale hiện tại
      const nsMessages = (
        await import(`../../messages/${locale}/${namespace}.json`)
      ).default;
      messages[namespace] = nsMessages;
    } catch {
      // Fallback về tiếng Việt nếu không tìm thấy
      try {
        const fallbackMessages = (
          await import(`../../messages/vi/${namespace}.json`)
        ).default;
        messages[namespace] = fallbackMessages;
        console.warn(
          `[i18n] Namespace "${namespace}" not found for locale "${locale}", using Vietnamese fallback`,
        );
      } catch {
        console.warn(
          `[i18n] Namespace "${namespace}" not found for any locale`,
        );
      }
    }
  }

  return messages;
}

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const messages = await loadMessages(locale);

  return {
    locale,
    messages,
  };
});
