import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { columns } from "./_components/columns";
import { DataTable } from "./_components/data-table";
import { User } from "@/types/user";
import { apiServer } from "@/lib/utils/fetch-server";
import {
  PaginatedResponse,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from "@/types/api";
import { getTranslations } from "next-intl/server";

/**
 * Lấy danh sách nhân viên từ API
 * @server-only
 */
async function getEmployees(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_PAGE_SIZE,
): Promise<User[]> {
  try {
    const result = await apiServer.get<PaginatedResponse<User>>(
      `/api/company/employees?page=${page}&size=${size}`,
      { cache: "no-store" },
    );
    return result.content;
  } catch (error) {
    console.error("Error fetching employees:", error);
    return [];
  }
}

export default async function DashboardEmployeesPage() {
  const data = await getEmployees();
  const tCommon = await getTranslations("common");

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Link href="/dashboard/employees/create">
          <Button>
            <Plus />
            {tCommon("add")}
          </Button>
        </Link>
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  );
}
