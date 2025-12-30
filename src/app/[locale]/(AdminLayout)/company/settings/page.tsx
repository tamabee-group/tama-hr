import { getTranslations } from "next-intl/server";

export default async function CompanySettingsPage() {
  const t = await getTranslations("settings");
  const tCompanies = await getTranslations("companies");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {tCompanies("featureUpdating")}
        </p>
      </div>
    </div>
  );
}
