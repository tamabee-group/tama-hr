import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ContractsPageContent } from "./_page-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("schedulers");
  return { title: t("subPages.contracts") };
}

export default function ContractExpirySchedulerPage() {
  return <ContractsPageContent />;
}
