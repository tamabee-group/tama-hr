import { getTranslations } from "next-intl/server";
import { ContractTable } from "./_contract-table";

/**
 * Trang quản lý hợp đồng lao động
 * Server Component - hiển thị danh sách contracts với status
 */
export default async function CompanyContractsPage() {
  const t = await getTranslations("contracts");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("description")}</p>
      </div>

      <ContractTable />
    </div>
  );
}
