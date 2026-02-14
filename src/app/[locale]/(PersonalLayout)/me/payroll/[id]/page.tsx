import { PayslipDetail } from "./_payslip-detail";

interface PayslipDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Trang chi tiết phiếu lương của nhân viên
 * Hiển thị layout 4 cột giống trang admin
 */
export default async function PayslipDetailPage({
  params,
}: PayslipDetailPageProps) {
  const { id } = await params;
  return <PayslipDetail itemId={parseInt(id, 10)} />;
}
