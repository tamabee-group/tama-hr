import { PageContent } from "./_page-content";
import { SupportedLocale } from "@/lib/utils/format-currency";

interface PageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Server Component cho Dashboard Wallet page
 * Render PageContent client component với locale từ params
 */
export default async function DashboardWalletPage({ params }: PageProps) {
  const { locale } = await params;

  return <PageContent locale={(locale as SupportedLocale) || "vi"} />;
}
