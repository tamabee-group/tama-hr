import { getTranslations } from "next-intl/server";
import { AdjustmentDetailContent } from "./_page-content";

interface AdjustmentDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Trang chi tiết yêu cầu điều chỉnh chấm công
 * Server Component - fetch translations và render AdjustmentDetailContent
 */
export default async function AdjustmentDetailPage({
  params,
}: AdjustmentDetailPageProps) {
  const { id } = await params;
  const t = await getTranslations("attendance");

  const adjustmentId = parseInt(id, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("adjustment.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("adjustment.viewDetail")}
        </p>
      </div>

      <AdjustmentDetailContent adjustmentId={adjustmentId} />
    </div>
  );
}
