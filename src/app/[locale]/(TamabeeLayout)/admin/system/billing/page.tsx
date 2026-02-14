import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BillingPageContent } from "./_page-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("schedulers");
  return { title: t("subPages.billing") };
}

export default function BillingSchedulerPage() {
  return <BillingPageContent />;
}
