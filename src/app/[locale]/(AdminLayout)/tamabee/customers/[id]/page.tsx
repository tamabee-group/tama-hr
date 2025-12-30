import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { CustomerProfileForm } from "./CustomerProfileForm";
import { Company } from "@/types/company";
import { apiServer } from "@/lib/utils/fetch-server";

/**
 * Lấy thông tin công ty từ API
 * @server-only
 */
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

export default async function CustomerDetailPage({
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
        <Link
          href={`/${locale}/tamabee/customers`}
          className="hover:opacity-70"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold">{t("customerDetail")}</h1>
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6">
        <div className="2xl:col-span-2">
          <CustomerProfileForm company={company} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("companyWallet")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("featureUpdating")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("employees")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("featureUpdating")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
