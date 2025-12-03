import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  // Step 1: Use the incoming request (example)
  const defaultLocale = request.headers.get("x-your-custom-locale") || "ja";

  // Step 2: Create and call the next-intl middleware (example)
  const handleI18nRouting = createMiddleware({
    locales: ["vi", "en", "ja"],
    defaultLocale: "ja",
    localeDetection: true,
  });
  const response = handleI18nRouting(request);

  // Step 3: Alter the response (example)
  response.headers.set("x-your-custom-locale", defaultLocale);

  return response;
}

export const config = {
  // Match only internationalized pathnames
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
