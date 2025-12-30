import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
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
 * Lấy danh sách users từ API
 * @server-only
 */
async function getUsers(
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_PAGE_SIZE,
): Promise<User[]> {
  try {
    const result = await apiServer.get<PaginatedResponse<User>>(
      `/api/admin/users?page=${page}&size=${size}`,
      { cache: "no-store" },
    );
    return result.content;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export default async function TamabeeUsersPage() {
  const data = await getUsers();
  const t = await getTranslations("users");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Link href="/tamabee/users/register">
          <Button>
            <Plus />
            {t("registerNew")}
          </Button>
        </Link>
      </div>

      <DataTable data={data} />
    </div>
  );
}
