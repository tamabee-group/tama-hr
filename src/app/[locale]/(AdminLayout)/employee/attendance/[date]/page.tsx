import { AttendanceDayDetailContent } from "./_page-content";

interface AttendanceDayDetailPageProps {
  params: Promise<{
    date: string;
  }>;
}

/**
 * Trang chi tiết chấm công theo ngày (Server Component)
 * URL: /employee/attendance/[date] (YYYY-MM-DD)
 */
export default async function AttendanceDayDetailPage({
  params,
}: AttendanceDayDetailPageProps) {
  const { date } = await params;

  return (
    <div className="space-y-6">
      <AttendanceDayDetailContent date={date} />
    </div>
  );
}
