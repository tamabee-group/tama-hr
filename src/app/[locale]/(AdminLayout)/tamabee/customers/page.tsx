import { columns } from "./_components/columns";
import { DataTable } from "./_components/data-table";
import { Company } from "@/types/company";
import { apiServer } from "@/lib/utils/fetch-server";

// Response type cho paginated data
interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Cấu hình phân trang mặc định
const DEFAULT_PAGE = 0;
const DEFAULT_LIMIT = 10;

/**
 * Lấy danh sách công ty từ API
 * @server-only
 */
async function getCompanies(
  page: number = DEFAULT_PAGE,
  limit: number = DEFAULT_LIMIT,
): Promise<Company[]> {
  try {
    const result = await apiServer.get<PageResponse<Company>>(
      `/api/admin/companies?page=${page}&size=${limit}`,
      { cache: "no-store" },
    );
    return result.content;
  } catch (error) {
    console.error("Error fetching companies:", error);
    return [];
  }
}

export default async function TamabeeCustomersPage() {
  const page = DEFAULT_PAGE;
  const limit = DEFAULT_LIMIT;
  const data = await getCompanies(page, limit);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý khách hàng</h1>
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  );
}
