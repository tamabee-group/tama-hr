import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { columns } from "./_components/columns";
import { DataTable } from "./_components/data-table";
import { User } from "@/types/user";
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

async function getEmployees(
  page: number = DEFAULT_PAGE,
  limit: number = DEFAULT_LIMIT,
): Promise<User[]> {
  try {
    const result = await apiServer.get<PageResponse<User>>(
      `/api/company/employees?page=${page}&size=${limit}`,
      { cache: "no-store" },
    );
    return result.content;
  } catch (error) {
    console.error("Error fetching employees:", error);
    return [];
  }
}

export default async function CompanyEmployeesPage() {
  const page = DEFAULT_PAGE;
  const limit = DEFAULT_LIMIT;
  const data = await getEmployees(page, limit);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý nhân viên</h1>
        <Link href="/company/employees/create">
          <Button>
            <Plus />
            Thêm nhân viên
          </Button>
        </Link>
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  );
}
