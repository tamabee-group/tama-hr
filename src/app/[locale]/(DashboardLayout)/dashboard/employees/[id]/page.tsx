import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeProfileForm } from "./_employee-profile-form";
import { EmployeeDetail } from "../_employee-detail";
import { User } from "@/types/user";
import { apiServer } from "@/lib/utils/fetch-server";
import { getTranslations } from "next-intl/server";

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
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const employee = await getEmployee(id);
  const t = await getTranslations("users");
  const tCommon = await getTranslations("common");

  if (!employee) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/employees" className="hover:opacity-70">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{t("userDetail")}</h1>
          <p className="text-sm text-muted-foreground">
            {employee.profile?.name || employee.email}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">{tCommon("overview")}</TabsTrigger>
          <TabsTrigger value="profile">{t("personalInfo")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <EmployeeDetail employee={employee} />
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <EmployeeProfileForm employee={employee} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
