import { getTranslations } from "next-intl/server";
import { SwapRequestList } from "./_swap-request-list";

/**
 * Trang quản lý yêu cầu đổi ca
 * Server Component - fetch translations và render SwapRequestList
 */
export default async function ShiftSwapsPage() {
  const t = await getTranslations("shifts");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("swapsTitle")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("swapsDescription")}
        </p>
      </div>

      <SwapRequestList />
    </div>
  );
}
