import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TenantsPageContent } from "./_page-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("schedulers");
  return { title: t("subPages.tenants") };
}

export default function TenantCleanupSchedulerPage() {
  return <TenantsPageContent />;
}
