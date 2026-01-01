import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmployeeAttendancePageContent } from "./_page-content";

/**
 * Trang chấm công của Employee (Server Component)
 * Hiển thị check-in section và calendar view
 */
export default async function EmployeeAttendancePage() {
  const t = await getTranslations("attendance");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/employee/adjustments">
            <FileText className="h-4 w-4 mr-2" />
            {t("adjustmentHistory")}
          </Link>
        </Button>
      </div>

      <EmployeeAttendancePageContent />
    </div>
  );
}
