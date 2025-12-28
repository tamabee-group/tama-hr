import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { EmployeeProfileForm } from "./_employee-profile-form";
import { EmployeeActivity } from "./_employee-activity";
import { User } from "@/types/user";
import { apiServer } from "@/lib/utils/fetch-server";

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
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const employee = await getEmployee(id);

  if (!employee) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/company/employees" className="hover:opacity-70">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold">Chi tiết nhân viên</h1>
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6">
        <div className="2xl:col-span-2">
          <EmployeeProfileForm employee={employee} />
        </div>

        <div className="space-y-6">
          <EmployeeActivity employeeId={employee.id} />

          <Card>
            <CardHeader>
              <CardTitle>Bảng lương</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Chức năng đang cập nhật
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
