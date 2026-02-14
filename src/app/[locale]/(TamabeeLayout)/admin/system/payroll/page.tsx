import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PayrollPageContent } from "./_page-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("schedulers");
  return { title: t("subPages.payroll") };
}

export default function PayrollSchedulerPage() {
  return <PayrollPageContent />;
}
