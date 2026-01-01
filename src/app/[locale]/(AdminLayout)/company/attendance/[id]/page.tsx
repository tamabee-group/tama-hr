import { getTranslations } from "next-intl/server";
import { AttendanceDetailContent } from "./_page-content";

interface AttendanceDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Trang chi tiết attendance record
 * Server Component - fetch translations và render AttendanceDetailContent
 */
export default async function AttendanceDetailPage({
  params,
}: AttendanceDetailPageProps) {
  const { id } = await params;
  const t = await getTranslations("attendance");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("description")}</p>
      </div>

      <AttendanceDetailContent attendanceId={parseInt(id, 10)} />
    </div>
  );
}
