import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { CustomerProfileForm } from "./_customer-profile-form";
import { Company } from "@/types/company";
import { apiServer } from "@/lib/utils/fetch-server";

async function getCompany(id: string): Promise<Company | null> {
  try {
    return await apiServer.get<Company>(`/api/admin/companies/${id}`, {
      cache: "no-store",
    });
  } catch (error) {
    console.error("Error fetching company:", error);
    return null;
  }
}

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id, locale } = await params;
  const t = await getTranslations("companies");
  const company = await getCompany(id);

  if (!company) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/admin/companies`} className="hover:opacity-70">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold">{t("customerDetail")}</h1>
      </div>
      <CustomerProfileForm company={company} />
    </div>
  );
}
