import { AttendanceDetailContent } from "./_page-content";

interface Props {
  params: Promise<{ date: string }>;
  searchParams: Promise<{ employeeId?: string }>;
}

export default async function DashboardAttendanceDetailPage({
  params,
  searchParams,
}: Props) {
  const { date } = await params;
  const { employeeId } = await searchParams;

  return (
    <AttendanceDetailContent
      date={date}
      employeeId={employeeId ? parseInt(employeeId, 10) : undefined}
    />
  );
}
