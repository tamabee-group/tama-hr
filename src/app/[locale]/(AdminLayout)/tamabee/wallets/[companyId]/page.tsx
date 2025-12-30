import { WalletDetailContent } from "./_wallet-detail-content";
import { SupportedLocale } from "@/lib/utils/format-currency";

interface PageProps {
  params: Promise<{
    locale: string;
    companyId: string;
  }>;
}

/**
 * Server Component - Trang chi tiết wallet của một công ty cho Tamabee Admin
 * Delegate rendering cho WalletDetailContent client component
 */
export default async function CompanyWalletDetailPage({ params }: PageProps) {
  const { locale, companyId } = await params;
  const parsedCompanyId = parseInt(companyId, 10);
  const supportedLocale = (locale as SupportedLocale) || "vi";

  return (
    <WalletDetailContent companyId={parsedCompanyId} locale={supportedLocale} />
  );
}
