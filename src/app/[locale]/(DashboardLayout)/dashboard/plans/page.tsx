import { getTranslations } from "next-intl/server";
import { apiServer } from "@/lib/utils/fetch-server";
import { Company } from "@/types/company";
import { PlansContent } from "./_plans-content";

export default async function PlansPage() {
  const t = await getTranslations("plans");
  const company = await apiServer.get<Company>("/api/company/profile");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <PlansContent currentPlanId={company.planId ?? null} />
    </div>
  );
}
