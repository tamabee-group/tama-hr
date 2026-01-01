import { getTranslations } from "next-intl/server";
import { LeaveRequestDetail } from "../_leave-request-detail";

interface LeaveRequestDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Trang chi tiết yêu cầu nghỉ phép (Company)
 * Server Component - fetch translations và render LeaveRequestDetail
 */
export default async function LeaveRequestDetailPage({
  params,
}: LeaveRequestDetailPageProps) {
  const { id } = await params;
  const t = await getTranslations("leave");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("description")}</p>
      </div>

      <LeaveRequestDetail requestId={parseInt(id)} />
    </div>
  );
}
