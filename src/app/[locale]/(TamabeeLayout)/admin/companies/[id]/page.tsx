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
  const { id } = await params;
  const company = await getCompany(id);

  if (!company) {
    notFound();
  }

  return <CustomerProfileForm company={company} />;
}
