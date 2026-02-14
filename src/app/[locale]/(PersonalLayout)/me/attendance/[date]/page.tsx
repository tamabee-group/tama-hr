import { AttendanceDateContent } from "./_attendance-date-content";

interface PageProps {
  params: Promise<{ date: string }>;
}

export default async function AttendanceDatePage({ params }: PageProps) {
  const { date } = await params;

  return <AttendanceDateContent date={date} />;
}
