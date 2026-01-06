import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { User } from "@/types/user";
import { apiServer } from "@/lib/utils/fetch-server";
import { getTranslations } from "next-intl/server";
import { EmployeeAttendanceContent } from "./_employee-attendance-content";

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

export default async function EmployeeAttendancePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const employee = await getEmployee(id);
  const t = await getTranslations("attendance");

  if (!employee) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/employees/${id}`} className="hover:opacity-70">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {employee.profile?.name || employee.email}
          </p>
        </div>
      </div>

      {/* Content */}
      <EmployeeAttendanceContent employeeId={employee.id} />
    </div>
  );
}
