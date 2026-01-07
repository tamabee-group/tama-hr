import { getTranslations } from "next-intl/server";
import { SettingsContent } from "./_settings-content";

export default async function TamabeeSettingsPage() {
  const t = await getTranslations("tamabeeSettings");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <SettingsContent />
    </div>
  );
}
