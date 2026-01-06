import { getTranslations } from "next-intl/server";

/**
 * Trang thông tin cá nhân
 * Server Component
 */
export default async function ProfilePage() {
  const t = await getTranslations("companies");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("companyInfo")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("featureUpdating")}
        </p>
      </div>
    </div>
  );
}
