import { getTranslations } from "next-intl/server";
import { ScheduleDetail } from "../_schedule-detail";

interface ScheduleDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Trang chi tiết lịch làm việc
 * Server Component - fetch translations và render ScheduleDetail
 */
export default async function ScheduleDetailPage({
  params,
}: ScheduleDetailPageProps) {
  const { id } = await params;
  const t = await getTranslations("schedules");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("description")}</p>
      </div>

      <ScheduleDetail scheduleId={parseInt(id, 10)} />
    </div>
  );
}
