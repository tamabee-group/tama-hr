import { getTranslations } from "next-intl/server";
import { ContractTable } from "./_contract-table";
import { ExplanationPanel } from "../_components/_explanation-panel";

/**
 * Trang quản lý hợp đồng lao động
 * Server Component - hiển thị danh sách contracts với status
 */
export default async function DashboardContractsPage() {
  const t = await getTranslations("contracts");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("description")}</p>
      </div>

      <ExplanationPanel
        title={t("guide.title")}
        description={t("guide.description")}
        tips={[
          t("guide.tip1"),
          t("guide.tip2"),
          t("guide.tip3"),
          t("guide.tip4"),
          t("guide.tip5"),
        ]}
        defaultCollapsed={true}
      />

      <ContractTable />
    </div>
  );
}
