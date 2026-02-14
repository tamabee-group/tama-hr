import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SchedulersPageContent } from "./_page-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("schedulers");
  return {
    title: t("title"),
  };
}

export default function SchedulersPage() {
  return <SchedulersPageContent />;
}
