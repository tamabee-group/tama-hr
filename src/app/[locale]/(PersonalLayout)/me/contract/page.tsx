import { getTranslations } from "next-intl/server";
import { ContractContent } from "./_contract-content";

// ============================================
// Metadata
// ============================================

export async function generateMetadata() {
  const t = await getTranslations("portal.contract");
  return {
    title: t("title"),
    description: t("description"),
  };
}

// ============================================
// Page Component (Server Component)
// ============================================

export default function ContractPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <ContractContent />
    </div>
  );
}
