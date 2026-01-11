import { getTranslations } from "next-intl/server";
import { BillingContent } from "./_billing-content";

export default async function BillingPage() {
  const t = await getTranslations("billing");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <BillingContent />
    </div>
  );
}
