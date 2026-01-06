import { getTranslations } from "next-intl/server";

/**
 * Dashboard home page
 * Hiển thị overview cho tất cả users (kể cả Tamabee employees)
 */
export default async function DashboardPage() {
  const t = await getTranslations("header");
  const tCompanies = await getTranslations("companies");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("dashboard")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {tCompanies("featureUpdating")}
        </p>
      </div>
    </div>
  );
}
