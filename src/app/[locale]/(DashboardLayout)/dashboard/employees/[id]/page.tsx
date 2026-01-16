import { notFound } from "next/navigation";
import { apiServer } from "@/lib/utils/fetch-server";
import { User } from "@/types/user";
import { EmployeeDetailContent } from "./_employee-detail-content";

/**
 * Lấy thông tin nhân viên từ API
 * @server-only
 */
async function getEmployee(id: string): Promise<User | null> {
  try {
    return await apiServer.get<User>(`/api/company/employees/${id}`, {
      cache: "no-store",
    });
  } catch (error) {
    console.error("Error fetching employee:", error);
    return null;
  }
}

export default async function EmployeeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  const employee = await getEmployee(id);

  if (!employee) {
    notFound();
  }

  return <EmployeeDetailContent employee={employee} initialTab={tab} />;
}
