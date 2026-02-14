import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CleanupPageContent } from "./_page-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("schedulers");
  return { title: t("subPages.cleanup") };
}

export default function CompanyCleanupSchedulerPage() {
  return <CleanupPageContent />;
}
