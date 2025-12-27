import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { UserProfileForm } from "./UserProfileForm";
import { UserActivity } from "./UserActivity";
import { User } from "@/types/user";
import { apiServer } from "@/lib/utils/fetch-server";

async function getUser(id: string): Promise<User | null> {
  try {
    return await apiServer.get<User>(`/api/admin/users/${id}`, {
      cache: "no-store",
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const user = await getUser(id);

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/tamabee/users" className="hover:opacity-70">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold">Chi tiết người dùng</h1>
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6">
        <div className="2xl:col-span-2">
          <UserProfileForm user={user} />
        </div>

        <div className="space-y-6">
          <UserActivity userId={user.id} />

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
