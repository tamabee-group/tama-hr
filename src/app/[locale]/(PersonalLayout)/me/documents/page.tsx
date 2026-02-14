import { getTranslations } from "next-intl/server";
import { DocumentsContent } from "./_documents-content";

// ============================================
// Metadata
// ============================================

export async function generateMetadata() {
  const t = await getTranslations("portal.documents");
  return {
    title: t("title"),
    description: t("description"),
  };
}

// ============================================
// Page Component (Server Component)
// ============================================

export default function DocumentsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <DocumentsContent />
    </div>
  );
}
