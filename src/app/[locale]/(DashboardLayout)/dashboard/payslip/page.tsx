import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PayslipPageContent } from "./_page-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("payroll");
  return {
    title: t("payslipHistory"),
  };
}

export default function PayslipPage() {
  return <PayslipPageContent />;
}
