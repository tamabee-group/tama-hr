import { getTranslations } from "next-intl/server";
import { AttendanceDetailContent } from "./_page-content";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DashboardAttendanceDetailPage({ params }: Props) {
  const { id } = await params;
  const t = await getTranslations("attendance");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{t("detail.title")}</h1>
        <p className="text-muted-foreground">{t("detail.description")}</p>
      </div>
      <AttendanceDetailContent attendanceId={parseInt(id)} />
    </div>
  );
}
