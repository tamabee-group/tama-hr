import { getTranslations } from "next-intl/server";
import { DataTable } from "./_components/data-table";
import { Company } from "@/types/company";
import { apiServer } from "@/lib/utils/fetch-server";
import {
  PaginatedResponse,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from "@/types/api";

/**
 * Lấy danh sách công ty từ API
 * @server-only
 */
async function getCompanies(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_PAGE_SIZE,
): Promise<Company[]> {
  try {
    const result = await apiServer.get<PaginatedResponse<Company>>(
      `/api/admin/companies?page=${page}&size=${size}`,
      { cache: "no-store" },
    );
    return result.content;
  } catch (error) {
    console.error("Error fetching companies:", error);
    return [];
  }
}

export default async function AdminCompaniesPage() {
  const t = await getTranslations("companies");
  const data = await getCompanies();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
      </div>

      <DataTable data={data} />
    </div>
  );
}
